import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errorHandler";

const REQUIRED_HEADER = "x-sediment-client";
const REQUIRED_VALUE = "web";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Defense-in-depth CSRF mitigation for a cookie-authenticated JSON API.
 *
 * The API already gets meaningful CSRF protection "for free" from two things: (1) CORS is
 * locked to a single configured origin with credentials, so a cross-origin `fetch`/XHR with
 * `Content-Type: application/json` triggers a preflight that only WEB_ORIGIN can pass, and
 * (2) `express.json()` only parses bodies sent with that same content type, so a plain HTML
 * form (which can never set an arbitrary JSON content type or custom header) can't produce a
 * body our routes will accept in the first place.
 *
 * This middleware adds one more explicit layer on top: every state-changing request must
 * carry a custom header that only same-origin JavaScript (never a bare HTML form, and never
 * a simple cross-origin request) can attach. `lib/api.ts` on the frontend sets it automatically.
 */
export function csrfHeaderCheck(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get(REQUIRED_HEADER) === REQUIRED_VALUE) return next();
  next(new HttpError(403, "Missing or invalid client header — request rejected as a CSRF precaution."));
}
