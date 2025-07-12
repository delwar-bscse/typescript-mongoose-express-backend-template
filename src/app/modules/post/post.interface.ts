import { Model, Types } from 'mongoose';

export type IPost = {
  creatorId:  Types.ObjectId;
  title: string;
  description: string;
  image: string;
};

export type IPartialPostWithCreatorId = Partial<Omit<IPost, 'creatorId'>> & Pick<IPost, 'creatorId'>;


export type IPostModal = Model<IPost>;
