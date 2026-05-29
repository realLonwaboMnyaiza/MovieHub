import { Request, Response, NextFunction } from 'express';

export default function authorize(req: Request, res: Response, next: NextFunction) {
    if (!req.token.isAdmin)
    return res
      .status(403)
      .send(
        'Elavated privilege needed to access this resource. Access Denied!',
      );
  return next();
}
