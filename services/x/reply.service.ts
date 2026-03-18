import { postReply } from "@/integrations/x/reply";

export const replyToTweet = async (
  text: string,
  tweetId: string,
): Promise<{ tweetId: string }> => {
  const result = await postReply(text, tweetId);
  return { tweetId: result.data?.id };
};
