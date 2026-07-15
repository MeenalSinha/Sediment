import type { NextFunction, Request, Response } from "express";
import { verifySessionToken } from "../utils/jwt";
import { HttpError } from "./errorHandler";

export const SESSION_COOKIE_NAME = "sediment_session";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; redditUsername: string };
    }
  }
}

export function attachSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    try {
      const payload = verifySessionToken(token);
      req.auth = { userId: payload.userId, redditUsername: payload.redditUsername };
    } catch {
      // Invalid/expired token — treated as unauthenticated, not a hard error.
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    return next(new HttpError(401, "You must be signed in with Reddit to do that."));
  }
  next();
}
