import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { polishLore, translateInscription, generateCivilization, summarizeArtifact } from "../ai/client";

export const aiRouter = Router();

export const polishSchema = z.object({ text: z.string().min(1).max(2000) });

aiRouter.post(
  "/polish-lore",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { text } = polishSchema.parse(req.body);
    const polished = await polishLore(text);
    res.json({ polished });
  }),
);

export const translateSchema = z.object({ description: z.string().min(1).max(1000) });

aiRouter.post(
  "/translate-inscription",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { description } = translateSchema.parse(req.body);
    const translation = await translateInscription(description);
    res.json({ translation });
  }),
);

export const civSchema = z.object({ subredditName: z.string().min(1).max(60) });

aiRouter.post(
  "/generate-civilization",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { subredditName } = civSchema.parse(req.body);
    const civilization = await generateCivilization(subredditName);
    res.json(civilization);
  }),
);

export const summarySchema = z.object({
  name: z.string(),
  category: z.string(),
  material: z.string(),
  period: z.string(),
});

aiRouter.post(
  "/summarize-artifact",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = summarySchema.parse(req.body);
    const summary = await summarizeArtifact(input);
    res.json({ summary });
  }),
);
