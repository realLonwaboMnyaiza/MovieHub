import pathModule from 'path';
import config from 'dotenv';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const environment = process.env.NODE_ENV;
const path = pathModule.join(process.cwd(), `.env.${environment}`);
config.config({ path });

declare module 'express-serve-static-core' {
  interface Request {
    token: JwtPayload;
  }
}

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token to redeem.');

  try {
    const privateKey = process.env.KEY;
    if (!privateKey) throw Error('Failed to retrieve private key.');
    const decodedToken = jwt.verify(token, privateKey, {
      algorithms: ['HS256'],
    });
    req.token = decodedToken as JwtPayload;
    return next();
  } catch (error) {
    return next(error);
  }
}
