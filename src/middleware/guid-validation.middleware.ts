import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

declare module "express-serve-static-core" {
  interface Request {
    guid: string;
  }
}

export default function validateGuid(req: Request, res: Response, next: NextFunction) {
  const resourceId = req.params.id as string;
  if (!mongoose.Types.ObjectId.isValid(resourceId))
    return res.status(404).send('Invalid ID provided.');

  req.guid = resourceId;
  return next();
}

export function isValidGuid(objectId: string): boolean {
  return validateWithMongoose(objectId);
}

function validateWithMongoose(guid: string): boolean {
  return mongoose.Types.ObjectId.isValid(guid);
}

// @ts-expect-error: Suppress unused warning for this specific line
function validateWithRegex(guid: string): boolean {
  const guidRegex = validGuidRegex();
  return guidRegex.test(guid);
}

export function validGuidRegex(): RegExp {
  return /^[0-9a-fA-F]{24}$/;
}
