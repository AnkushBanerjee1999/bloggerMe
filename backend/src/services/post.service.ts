import { PostModel } from '../models/Post.js';
import type { IPost } from '../models/Post.js';
import { uniqueSlug } from '../utils/slug.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import type { IUser } from '../models/User.js';
import { UserModel } from '../models/User.js';
import { CommentModel } from '../models/Comment.js';

export interface CreatePostInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  status?: 'published' | 'draft';
}

export interface UpdatePostInput {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  status?: 'published' | 'draft';
}

export interface PostQuery {
  page: number;
  limit: number;
  sort: 'newest' | 'oldest' | 'popular';
  status?: 'published' | 'draft';
  search?: string;
  tag?: string;
  authorId?: string;
}

interface PostWithAuthor {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

function buildSort(sort: PostQuery['sort']): Record<string, 1 | -1> {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'popular':
      return { views: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

interface PopulatedAuthor {
  _id: { toString(): string };
  name: string;
  avatar: string;
}

interface PopulatedPost extends Omit<IPost, 'author'> {
  author: PopulatedAuthor;
}

function toPostDTO(post: PopulatedPost | IPost): PostWithAuthor {
  const author = post.author as unknown;
  const isPopulated = author !== null && typeof author === 'object' && '_id' in (author as object);
  const populated = isPopulated ? (author as PopulatedAuthor) : null;
  const rawId = isPopulated ? populated!._id.toString() : String(author ?? '');

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    tags: post.tags,
    status: post.status,
    authorId: rawId,
    authorName: populated?.name ?? '',
    authorAvatar: populated?.avatar ?? '',
    views: post.views,
    likes: post.likes,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export const postService = {
  async list(query: PostQuery) {
    const filter: Record<string, unknown> = { deletedAt: null };

    // Non-admins only see published posts
    filter.status = query.status ?? 'published';

    if (query.authorId) {
      filter.author = query.authorId;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }
    if (query.tag) {
      filter.tags = { $in: [query.tag] };
    }

    const skip = (query.page - 1) * query.limit;
    const [docs, totalItems] = await Promise.all([
      PostModel.find(filter)
        .sort(buildSort(query.sort))
        .skip(skip)
        .limit(query.limit)
        .populate('author', 'name avatar')
        .exec(),
      PostModel.countDocuments(filter),
    ]);

    const items = docs.map((p) => toPostDTO(p as unknown as PopulatedPost));
    return { items, totalItems };
  },

  async getBySlug(slug: string, incrementViews = false) {
    const post = await PostModel.findOne({ slug, deletedAt: null }).populate('author', 'name avatar');
    if (!post) {
      throw new NotFoundError('Post');
    }

    if (incrementViews) {
      post.views += 1;
      await post.save();
    }

    return toPostDTO(post as unknown as PopulatedPost);
  },

  async create(author: IUser, input: CreatePostInput) {
    const slug = await uniqueSlug(input.title, async (s) => {
      const existing = await PostModel.findOne({ slug: s }).lean();
      return !!existing;
    });

    const post = await PostModel.create({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage ?? '',
      tags: input.tags ?? [],
      status: input.status ?? 'draft',
      author: author.id,
    });

    await post.populate('author', 'name avatar');
    return toPostDTO(post as unknown as PopulatedPost);
  },

  async update(postId: string, user: IUser, input: UpdatePostInput) {
    const post = await PostModel.findById(postId).setOptions({ includeDeleted: true });
    if (!post || post.deletedAt) {
      throw new NotFoundError('Post');
    }

    if (post.author.toString() !== user.id && user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own posts');
    }

    if (input.title && input.title !== post.title) {
      post.title = input.title;
      post.slug = await uniqueSlug(input.title, async (s) => {
        const existing = await PostModel.findOne({ slug: s, _id: { $ne: postId } }).lean();
        return !!existing;
      });
    }
    if (input.excerpt !== undefined) post.excerpt = input.excerpt;
    if (input.content !== undefined) post.content = input.content;
    if (input.coverImage !== undefined) post.coverImage = input.coverImage;
    if (input.tags !== undefined) post.tags = input.tags;
    if (input.status !== undefined) post.status = input.status;

    await post.save();
    await post.populate('author', 'name avatar');
    return toPostDTO(post as unknown as PopulatedPost);
  },

  async softDelete(postId: string, user: IUser) {
    const post = await PostModel.findById(postId).setOptions({ includeDeleted: true });
    if (!post || post.deletedAt) {
      throw new NotFoundError('Post');
    }

    if (post.author.toString() !== user.id && user.role !== 'admin') {
      throw new ForbiddenError('You can only delete your own posts');
    }

    post.deletedAt = new Date();
    await post.save();

    await CommentModel.updateMany(
      { post: postId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );

    return { id: post.id, deleted: true };
  },

  async getPublicStats() {
    const [totalPosts, totalUsers, totalComments] = await Promise.all([
      PostModel.countDocuments({ deletedAt: null, status: 'published' }),
      UserModel.countDocuments({ banned: false }),
      CommentModel.countDocuments({ deletedAt: null, status: 'visible' }),
    ]);

    return {
      publishedPosts: totalPosts,
      totalUsers,
      totalComments,
    };
  },
};
