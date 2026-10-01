import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  provider: 'local' | 'google' | 'facebook';
  providerId?: string;
  avatar: string;
  bio: string;
  banned: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must not exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.provider || this.provider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    providerId: {
      type: String,
      default: undefined,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio must not exceed 300 characters'],
    },
    banned: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

userSchema.index({ provider: 1, providerId: 1 }, { sparse: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const UserModel = mongoose.model<IUser>('User', userSchema);
