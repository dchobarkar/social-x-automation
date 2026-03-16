import { generateReplyVariants } from "@/integrations/openai/replyVariants";
import { searchTweetsByKeyword } from "@/integrations/x/search";

import type { XTweet } from "@/integrations/x/types";

export type SearchWithRepliesItem = {
  tweet: XTweet;
  humorous: string;
  insightful: string;
};

export const searchTweetsWithReplyVariants = async (
  query: string,
  maxResults: number,
): Promise<SearchWithRepliesItem[]> => {
  const tweets = await searchTweetsByKeyword(query, maxResults);

  const items: SearchWithRepliesItem[] = [];
  for (const tweet of tweets) {
    const variants = await generateReplyVariants(tweet.text);
    items.push({
      tweet,
      humorous: variants.humorous,
      insightful: variants.insightful,
    });
  }

  return items;
};

