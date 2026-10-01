import mongoose, { Schema, Document, Types } from 'mongoose';

export type CommentStatus = 'visible' | 'hidden';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  status: CommentStatus;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment must not exceed 2000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, status: 1, createdAt: -1 });

commentSchema.pre(/^find/, function (this: mongoose.Query<IComment, IComment>) {
  if (this.getOptions().includeDeleted) return;
  void this.where({ deletedAt: null });
});

export const CommentModel = mongoose.model<IComment>('Comment', commentSchema);
