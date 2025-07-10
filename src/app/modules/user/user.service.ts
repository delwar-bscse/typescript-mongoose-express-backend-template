import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser, PartialUserWithRequiredEmail } from './user.interface';
import { User } from './user.model';
import e from 'cors';

const createUserToDB = async (payload: PartialUserWithRequiredEmail): Promise<string> => {

  payload.role = USER_ROLES.USER;
  let message = '';
  let createUser: IUser = {} as IUser;

  const isExistUser = await User.isExistUserByEmail(payload?.email);

  if (isExistUser?.verified) {
    return "User already exist! Please Login";
  }

  if (isExistUser && !isExistUser?.verified) {
    createUser = isExistUser;
    message = "User already exist! Please verify your account";
  }

  if (!isExistUser) {
    const res = await User.create(payload);
    if (res) {
      createUser = res;
      message = 'User created successfully! Please verify your account';
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 1 * 60 * 1000),
  };
  await User.findOneAndUpdate(
    { email: createUser.email },
    { $set: { authentication } }
  );

  return message;
};


const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
};
