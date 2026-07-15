import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface SessionTokenPayload {
  userId: string;
  redditUsername: string;
}

export function signSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, env.session.jwtSecret, { expiresIn: env.session.jwtExpiresIn as any });
}

export function verifySessionToken(token: string): SessionTokenPayload {
  return jwt.verify(token, env.session.jwtSecret) as SessionTokenPayload;
}
