import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { attachSession } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimiter, authRateLimiter, writeActionRateLimiter } from "./middleware/rateLimit";
import { csrfHeaderCheck } from "./middleware/csrf";
import { authRouter } from "./routes/auth";
import { digSiteRouter } from "./routes/digsite";
import { artifactsRouter } from "./routes/artifacts";
import { museumRouter } from "./routes/museum";
import { loreRouter } from "./routes/lore";
import { communityRouter } from "./routes/community";
import { civilizationRouter } from "./routes/civilization";
import { aiRouter } from "./routes/ai";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.use(cors({ origin: env.webOrigin, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(attachSession);
  app.use(globalRateLimiter);
  app.use(csrfHeaderCheck);

  app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  app.use("/api/auth/reddit", authRateLimiter);
  app.use("/api/auth", authRouter);
  app.use("/api/digsite/stroke", writeActionRateLimiter);
  app.use("/api/digsite", digSiteRouter);
  app.use("/api/artifacts", artifactsRouter);
  app.use("/api/museum", museumRouter);
  app.use("/api/lore", writeActionRateLimiter, loreRouter);
  app.use("/api/community", writeActionRateLimiter, communityRouter);
  app.use("/api/civilization", civilizationRouter);
  app.use("/api/ai", aiRouter);

  app.use(errorHandler);

  return app;
}
