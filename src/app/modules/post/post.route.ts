import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PostValidation} from './post.validation';
import { PostController } from './post.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();


router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
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
