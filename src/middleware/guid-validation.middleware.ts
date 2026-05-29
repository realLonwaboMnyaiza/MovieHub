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
