import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    

    const result = await PostService.createPostToDB(req, res, next);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: null
    });
  }
);

export const PostController = { createPost };
