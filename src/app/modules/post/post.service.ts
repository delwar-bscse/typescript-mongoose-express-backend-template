import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPartialPostWithCreatorId, IPost } from './post.interface';
import { PostModel } from './post.model';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import unlinkFile from '../../../shared/unlinkFile';
import { NextFunction, Request, Response } from 'express';
import Busboy from 'busboy';

const createPostToDB = async (req: Request, res: Response, next: NextFunction): Promise<{ message: string }> => {

  const formData = await new Promise<IPost>((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      const result: Partial<IPost> = {};

      busboy.on('field', (name, value) => {
        result[name] = value;
      });

      busboy.on('finish', () => {
        if (!result.title || !result.description) {
          reject(new Error('Missing required fields'));
          return;
        }
        resolve(result as IPost);
      });

      busboy.on('error', (err) => {
        reject(err);
      });

      req.pipe(busboy);
    });

    // Here's where you'd normally save to database
    console.log('Received data:', {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      creatorId: formData.creatorId
    });

  // const newPost = {
  //   creatorId: user.id,
  //   title: data.title,
  //   description: data.description,
  // };
  // console.log("createPostToDB newPost: ", newPost);

  let message = '';


  // const { id } = user;

  // const result = await PostModel.create(data);
  // if (result) {
  //   message = 'Post created successfully!';
  // } else {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create post');
  // }
  return { message };
};

export const PostService = {
  createPostToDB,
};
