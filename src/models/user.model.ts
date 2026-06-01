import pathModule from 'path';
import config from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';
import { Schema, model, Model } from 'mongoose';
import passwordComplexity from 'joi-password-complexity';
const environment = process.env.NODE_ENV;
const path = pathModule.join(process.cwd(), `.env.${environment}`);

config.config({ path });

interface UserPayload {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

interface UserExtendedMethods {
  generateAuthenticationToken(): string;
}

type UserModel = Model<UserPayload, {}, UserExtendedMethods>;

const name = 'User';
const schema = new Schema<UserPayload, UserModel, UserExtendedMethods>({
  username: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  surname: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
});

schema.methods.generateAuthenticationToken = function (): string {
  const privateKey = process.env.KEY;
  const payload = { _id: this._id, isAdmin: this.isAdmin };
  const options: SignOptions = { expiresIn: '24h', algorithm: 'HS256' };
  if (privateKey) return jwt.sign(payload, privateKey, options);
  return 'generateAuthenticationToken - error';
};

export const User = model<UserPayload, UserModel>(name, schema);

export function validateSchema(
  input: UserPayload,
): Joi.ValidationResult<string> {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    name: Joi.string().min(5).max(50).required(),
    surname: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(50).required(),
    isAdmin: Joi.boolean().default(false),
  });

  return schema.validate(input);
}

export function validatePasswordComplexity(
  input: UserPayload,
): Joi.ValidationResult<string> {
  const complexityOptions = {
    min: 8,
    max: 50,
    lowerCase: 1,
    upperCase: 2,
    numeric: 3,
    symbol: 1,
    requirementCount: 1,
  };

  const passwordSchema = passwordComplexity(complexityOptions);
  return passwordSchema.validate(input.password);
}

export type { UserPayload };
