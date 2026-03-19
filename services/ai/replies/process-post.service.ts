import type { PlatformId, PostIntent, ReplyTone } from "@/types/ai/replies";
import { analyzePost } from "./analyze-post.service";
import { generateReply } from "./generate-reply.service";
import { suggestTones } from "./suggest-tone.service";
import { validateReply } from "./validate-reply.service";

const pickTone = (tones: ReplyTone[]): ReplyTone => tones[0] ?? "insightful";

export const generateSingleReplyForPostWithValidation = async (
  post: string,
  platform: PlatformId,
  forcedTone?: ReplyTone,
  knownIntent?: PostIntent,
): Promise<{
  reply: string;
  tone: ReplyTone;
  validation: Awaited<ReturnType<typeof validateReply>>;
}> => {
  const intent = knownIntent ?? (await analyzePost(post, platform)).intent;
  const tones = suggestTones(intent);
  const tone = forcedTone ?? pickTone(tones);

  const reply = await generateReply({
    post,
    tone,
    intent,
    platform,
  });

  const validation = await validateReply(reply, post, platform);

  return { reply, tone, validation };
};
