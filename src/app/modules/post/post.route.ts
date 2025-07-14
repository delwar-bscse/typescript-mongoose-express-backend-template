import express, { NextFunction, Request, Response } from 'express';
import { PostValidation } from './post.validation';
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
  )
  .get( PostController.getPosts);

router
  .route('/:postId')
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = PostValidation.updatePostZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return PostController.updatePost(req, res, next);
    }
  )
  .get( PostController.getSinglePost)
  .delete( PostController.deleteSinglePost);



export const PostRoutes = router;
