import mongoose, { Schema, Document, Types } from 'mongoose';

export type PostStatus = 'published' | 'draft';

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: PostStatus;
  author: Types.ObjectId;
  views: number;
  likes: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt must not exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        (tags: string[]) => tags.length <= 10,
        'A post can have at most 10 tags',
      ],
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1, status: 1 });
postSchema.index({ author: 1, createdAt: -1 });

// Only find non-deleted posts by default
postSchema.pre(/^find/, function (this: mongoose.Query<IPost, IPost>) {
  if (this.getOptions().includeDeleted) return;
  void this.where({ deletedAt: null });
});

export const PostModel = mongoose.model<IPost>('Post', postSchema);
