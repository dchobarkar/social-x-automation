import type { SearchWithRepliesItem } from "@/types/x/tweet";
import { generateReplyVariants } from "@/integrations/openai/replyVariants";
import { searchTweetsByKeyword } from "@/integrations/x/search";

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
      humorous: variants.witty ?? variants.helpful ?? "",
      insightful: variants.insightful ?? variants.professional ?? "",
    });
  }

  return items;
};
