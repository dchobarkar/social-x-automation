import type { ReplyVariants } from "@/types/ai";

import type { PlatformId, ReplyTone } from "./types";
import { analyzePost } from "./analyzePost";
import { generateReply } from "./generateReply";
import { suggestTones } from "./suggestTones";
import { validateReply } from "./validateReply";

const pickTone = (tones: ReplyTone[]): ReplyTone => tones[0] ?? "insightful";

export const generateSingleReplyForPost = async (
  post: string,
  platform: PlatformId,
  forcedTone?: ReplyTone,
): Promise<string> => {
  const analysis = await analyzePost(post, platform);
  const tones = suggestTones(analysis.intent);
  const tone = forcedTone ?? pickTone(tones);

  const reply = await generateReply({
    post,
    tone,
    intent: analysis.intent,
    platform,
  });

  const validation = await validateReply(reply, post, platform);
  if (!validation.isSafe) throw new Error("Reply failed validation");

  return reply;
};

export const generateReplyVariantsForPost = async (
  post: string,
  platform: PlatformId,
): Promise<ReplyVariants> => {
  const analysis = await analyzePost(post, platform);
  const tones = suggestTones(analysis.intent);

  const limitedTones = tones.slice(0, 3);

  const entries = await Promise.all(
    limitedTones.map(async (tone) => {
      const reply = await generateReply({
        post,
        tone,
        intent: analysis.intent,
        platform,
      });

      const validation = await validateReply(reply, post, platform);
      if (!validation.isSafe)
        throw new Error(`${tone} reply failed validation`);

      return [tone, reply] as const;
    }),
  );

  const variants: ReplyVariants = {};
  for (const [tone, reply] of entries) {
    variants[tone] = reply;
  }

  return variants;
};
