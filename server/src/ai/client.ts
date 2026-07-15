import OpenAI from "openai";
import { env } from "../config/env";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!env.openai.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. AI-assisted features (lore polishing, inscription translation, " +
          "civilization generation) are disabled until it is configured in your .env file.",
      );
    }
    client = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return client;
}

export async function polishLore(rawText: string): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: env.openai.model,
    messages: [
      {
        role: "system",
        content:
          "You are a museum copy editor. Lightly polish community-submitted archaeology lore for grammar, " +
          "clarity, and museum tone. Preserve the author's ideas, claims, and voice exactly — never invent " +
          "new facts, dates, or details that were not in the original text. Return only the polished text.",
      },
      { role: "user", content: rawText },
    ],
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content?.trim() ?? rawText;
}

export async function translateInscription(inscriptionDescription: string): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: env.openai.model,
    messages: [
      {
        role: "system",
        content:
          "You are an archaeological linguist for a fictional excavation game. Given a description of an " +
          "inscription found on an in-game artifact, invent a short, evocative, plausible-sounding " +
          "'translation' (2-4 sentences) fitting a lost civilization. Make clear this is a fictional in-game " +
          "translation, not a real historical claim.",
      },
      { role: "user", content: inscriptionDescription },
    ],
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export interface GeneratedCivilization {
  name: string;
  originStory: string;
}

export async function generateCivilization(subredditName: string): Promise<GeneratedCivilization> {
  const completion = await getClient().chat.completions.create({
    model: env.openai.model,
    messages: [
      {
        role: "system",
        content:
          "You invent original, never-repeated fictional civilizations for a community archaeology game tied " +
          "to a specific subreddit's theme. Respond ONLY with strict JSON: " +
          '{"name": string, "originStory": string (3-5 sentences)}. No markdown, no commentary.',
      },
      {
        role: "user",
        content: `Subreddit: ${subredditName}. Invent a civilization whose ruins this community will excavate.`,
      },
    ],
    temperature: 0.9,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    return JSON.parse(raw) as GeneratedCivilization;
  } catch {
    return { name: "The Forgotten Kingdom", originStory: raw };
  }
}

export async function summarizeArtifact(input: {
  name: string;
  category: string;
  material: string;
  period: string;
}): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: env.openai.model,
    messages: [
      {
        role: "system",
        content:
          "Write a two-sentence museum placard summary for a fictional excavated artifact in a community " +
          "archaeology game. Neutral, evocative, factual-sounding tone. No embellishment beyond the given facts.",
      },
      { role: "user", content: JSON.stringify(input) },
    ],
    temperature: 0.6,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
