import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import { IPaginationOptions } from '../../../types/pagination';


const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {


    const newData = req.body;
    newData.creatorId = req.user.id
    newData.image = getSingleFilePath(req.files, 'image');
    

    const result = await PostService.createPostToDB(newData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: null
    });
  }
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const postId = req.params.postId


    const newData = req.body;
    newData.creatorId = req.user.id
    newData.image = getSingleFilePath(req.files, 'image');
    

    const result = await PostService.updatePostToDB(newData, postId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: null
    });
  }
);

const getSinglePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const postId = req.params.postId
    

    const result = await PostService.getSinglePostToDB(postId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data 
    });
  }
);

const getPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

      // 1. Define which query fields are filters
  const filterableFields = ['searchTerm',];

  // 2. Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // 3. Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  };
    

    const result = await PostService.getPostsFromDB(filterOptions, paginationOptions);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Posts retrieved successfully",
      data: result,
    });
  }
);

const deleteSinglePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const postId = req.params.postId
    

    const result = await PostService.deleteSinglePostToDB(postId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: null
    });
  }
);

export const PostController = { createPost, updatePost, getSinglePost, deleteSinglePost, getPosts };
