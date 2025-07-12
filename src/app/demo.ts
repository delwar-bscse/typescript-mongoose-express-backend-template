// ........................Route........................... //
import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PostValidation} from './post.validation';
import { PostController } from './post.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();


router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = PostValidation.createPostZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return PostController.createPost(req, res, next);
    }
  );



export const PostRoutes = router;



// ........................controller........................... //
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };

    const result = await PostService.createPostToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: null
    });
  }
);

export const PostController = { createPost };



// ........................service........................... //
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPartialPostWithCreatorId } from './post.interface';
import { PostModel } from './post.model';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../../shared/unlinkFile';

const createPostToDB = async (user: JwtPayload, payload: IPartialPostWithCreatorId): Promise<{message: string}> => {
  let message = '';

  const { id } = user;
  
  const isExistPost = await PostModel.findOne({ title: payload?.title });

  if (isExistPost) {
    unlinkFile(payload?.image ?? '');
    return {message: "Post already exist!"};
  }

  const res = await PostModel.create({...payload, creatorId: id});
  if (res) {
    message = 'Post created successfully!';
  } else {
    unlinkFile(payload?.image ?? '');
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create post');
  }

  return {message};
};

export const PostService = {
  createPostToDB,
};



When I create an user I pass image and other data. I Post create then no problem. But If somehow post not create I unlink Image file. I think this is not better approach. Is there any better option to protect image upload before create post.