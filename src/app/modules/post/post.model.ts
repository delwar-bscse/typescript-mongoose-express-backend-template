import { model, Schema } from 'mongoose';
import { IPost, IPostModal } from './post.interface';

const postSchema = new Schema<IPost, IPostModal>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);


export const PostModel = model<IPost, IPostModal>(
  'Post',
  postSchema
);
