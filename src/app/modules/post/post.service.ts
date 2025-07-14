import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPartialPostWithCreatorId, IPost } from './post.interface';
import { PostModel } from './post.model';
import unlinkFile from '../../../shared/unlinkFile';
import { IPaginationOptions } from '../../../types/pagination';
import QueryBuilder from '../../builder/QueryBuilder';

const createPostToDB = async (newData: IPartialPostWithCreatorId): Promise<{ message: string }> => {

  let message = '';

  const isExistPost = await PostModel.findOne({ title: newData?.title });
  if (isExistPost) {
    unlinkFile(newData?.image ?? '');
    return { message: 'Post already exist!' };
  }

  const result = await PostModel.create(newData);
  console.log(result)
  if (result) {
    message = 'Post created successfully!';
  } else {
    unlinkFile(newData.image ?? '');
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create post');
  }
  return { message };
};

const getSinglePostToDB = async (postId: string): Promise<{ message: string }> => {

  let message = '';

  const isExistPost = await PostModel.findById(postId);
  if (!isExistPost) {
    return { data: null, message: 'Post does not exist!' };
  }
  
  return { data: isExistPost, message };
};

const getPostsFromDB = async (
  filterOptions: Record<string, unknown>,
  paginationOptions: IPaginationOptions
): Promise<{ pagination: IPaginationOptions; data: Partial<IPost>[] }> => {
  const { page = 1, limit = 10 } = paginationOptions;

  const query: Record<string, unknown> = {
    ...filterOptions,
    page,
    limit,
  };
  // console.log("All Queries: ", query);

  const searchableFields = ['title', 'description'];

  const builder = new QueryBuilder<IPost>(PostModel.find(), query);

  
  const populateFields = ['creatorId']; // Example populate fields
  const selectFields = {
    'creatorId': 'name email',
  };

  const usersQuery = builder
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(populateFields, selectFields);

  const data = await usersQuery.modelQuery.lean();
  const pagination = await builder.getPaginationInfo();

  return { pagination, data };
};

const deleteSinglePostToDB = async (postId: string): Promise<{ message: string }> => {

  const isExistPost = await PostModel.findByIdAndDelete(postId);
  if (!isExistPost) {
    return { message: 'Post does not exist!' };
  }
  
  unlinkFile(isExistPost.image ?? '');
  return { message: 'Post deleted successfully!' };
};

const updatePostToDB = async (newData: IPartialPostWithCreatorId, postId: string): Promise<{ message: string }> => {

  let message = '';

  const isExistPost = await PostModel.findById(postId);
  if (!isExistPost) {
    unlinkFile(newData?.image ?? '');
    return { message: 'Post does not exist!' };
  }

  const result = await PostModel.findByIdAndUpdate(postId, newData, { new: true }).exec();
  console.log(result)
  if (result) {
    message = 'Post updated successfully!';
    newData?.image && unlinkFile(isExistPost.image ?? '');
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update post');
  }
  return { message };
};

export const PostService = {
  createPostToDB,
  updatePostToDB,
  getSinglePostToDB,
  deleteSinglePostToDB,
  getPostsFromDB
};
