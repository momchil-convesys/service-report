import { NextFunction, Request, Response } from 'express';
import { AppUser, AuthService } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

  if (!token) {
    res.status(401).json({ error: 'Authorization token is required' });
    return;
  }

  try {
    const payload = AuthService.verifyToken(token);
    const user = AuthService.findById(payload.sub);

    if (!user) {
      res.status(401).json({ error: 'Invalid authorization token' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authorization token' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    next();
  };
};
