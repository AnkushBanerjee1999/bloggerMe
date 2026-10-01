import { CommentModel } from '../models/Comment.js';
import type { IComment } from '../models/Comment.js';
import { PostModel } from '../models/Post.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import type { IUser } from '../models/User.js';

export interface CreateCommentInput {
  content: string;
  postId: string;
}

export interface CommentDTO {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PopulatedAuthor {
  _id: { toString(): string };
  name: string;
  avatar: string;
}

interface PopulatedComment extends Omit<IComment, 'author'> {
  author: PopulatedAuthor;
}

function toCommentDTO(comment: PopulatedComment | IComment): CommentDTO {
  const author = comment.author as unknown;
  const isPopulated = author !== null && typeof author === 'object' && '_id' in (author as object);
  const populated = isPopulated ? (author as PopulatedAuthor) : null;
  const rawId = isPopulated ? populated!._id.toString() : String(author ?? '');

  return {
    id: comment.id,
    content: comment.content,
    postId: comment.post.toString(),
    authorId: rawId,
    authorName: populated?.name ?? '',
    authorAvatar: populated?.avatar ?? '',
    status: comment.status,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

import { emitToUser } from '../socket/index.js';

export const commentService = {
  async listByPost(postId: string, includeHidden = false) {
    const filter: Record<string, unknown> = { post: postId, deletedAt: null };
    if (!includeHidden) {
      filter.status = 'visible';
    }

    const comments = await CommentModel.find(filter)
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar')
      .exec();

    return comments.map((c) => toCommentDTO(c as unknown as PopulatedComment));
  },

  async create(user: IUser, input: CreateCommentInput) {
    const post = await PostModel.findOne({ _id: input.postId, deletedAt: null }).lean();
    if (!post) {
      throw new NotFoundError('Post');
    }

    const comment = await CommentModel.create({
      content: input.content,
      author: user.id,
      post: input.postId,
      status: 'visible',
    });

    await comment.populate('author', 'name avatar');
    const commentDTO = toCommentDTO(comment as unknown as PopulatedComment);

    // Notify post author in real-time (do not notify self)
    const postAuthorId = post.author.toString();
    if (postAuthorId !== user.id) {
      emitToUser(postAuthorId, {
        type: 'NEW_COMMENT',
        title: 'New comment on your post',
        message: `${user.name || 'Someone'} commented on "${post.title}"`,
        data: {
          postId: post._id.toString(),
          postSlug: post.slug,
          commentId: comment.id,
          authorName: user.name,
        },
      });
    }

    return commentDTO;
  },

  async update(commentId: string, user: IUser, content: string) {
    const comment = await CommentModel.findById(commentId).setOptions({ includeDeleted: true });
    if (!comment || comment.deletedAt) {
      throw new NotFoundError('Comment');
    }

    if (comment.author.toString() !== user.id && user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own comments');
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name avatar');
    return toCommentDTO(comment as unknown as PopulatedComment);
  },

  async softDelete(commentId: string, user: IUser) {
    const comment = await CommentModel.findById(commentId).setOptions({ includeDeleted: true });
    if (!comment || comment.deletedAt) {
      throw new NotFoundError('Comment');
    }

    if (comment.author.toString() !== user.id && user.role !== 'admin') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    comment.deletedAt = new Date();
    await comment.save();
    return { id: comment.id, deleted: true };
  },

  async setStatus(commentId: string, status: 'visible' | 'hidden') {
    const comment = await CommentModel.findById(commentId).setOptions({ includeDeleted: true });
    if (!comment || comment.deletedAt) {
      throw new NotFoundError('Comment');
    }

    comment.status = status;
    await comment.save();
    await comment.populate('author', 'name avatar');

    // Notify comment author in real-time
    const commentAuthorId = comment.author._id
      ? (comment.author as any)._id.toString()
      : comment.author.toString();

    emitToUser(commentAuthorId, {
      type: 'COMMENT_STATUS_CHANGED',
      title: 'Comment status updated',
      message: `Your comment was set to "${status}" by an administrator.`,
      data: {
        commentId: comment.id,
        postId: comment.post.toString(),
        status,
      },
    });

    return toCommentDTO(comment as unknown as PopulatedComment);
  },
};
