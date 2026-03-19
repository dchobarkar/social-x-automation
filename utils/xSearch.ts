import type { StoredTweet } from "@/types/x/tweet";
import type {
  NormalizedPost,
  SearchQueryBuilderParams,
} from "@/types/x/search";

const normalizeTerm = (value: string) => value.trim();

const wrapExactPhrase = (value: string) => {
  const phrase = value.trim().replace(/^"+|"+$/g, "");
  return phrase ? `"${phrase}"` : "";
};

const normalizeUserHandle = (value: string) => {
  const cleaned = value.trim().replace(/^@+/, "");
  return cleaned ? `from:${cleaned}` : "";
};

const normalizeHashtag = (value: string) => {
  const cleaned = value.trim().replace(/^#+/, "");
  return cleaned ? `#${cleaned}` : "";
};

export const splitSearchTerms = (value: string): string[] =>
  value
    .split(/\r?\n|,/)
    .map((term) => term.trim())
    .filter(Boolean);

export const buildSearchQuery = ({
  keywords,
  exactPhrases = [],
  excludeRetweets = false,
  englishOnly = false,
  verifiedOnly = false,
  fromUsers = [],
  hashtags = [],
}: SearchQueryBuilderParams): string => {
  const parts = [
    ...keywords.map(normalizeTerm),
    ...exactPhrases.map(wrapExactPhrase),
    ...fromUsers.map(normalizeUserHandle),
    ...hashtags.map(normalizeHashtag),
  ].filter(Boolean);

  if (excludeRetweets) parts.push("-is:retweet");
  if (verifiedOnly) parts.push("is:verified");
  if (englishOnly) parts.push("lang:en");

  return parts.join(" ").trim();
};

export const mapSearchPostsToStored = (
  posts: NormalizedPost[],
): StoredTweet[] =>
  posts.map((post) => ({
    id: post.id,
    text: post.text,
    selected: "insightful",
    created_at: post.createdAt,
    author_username: post.author.username,
    author_name: post.author.name,
    author_profile_image_url: post.author.profileImage,
    author_followers_count: post.author.followers,
    public_metrics: {
      like_count: post.metrics.likeCount,
      reply_count: post.metrics.replyCount,
      retweet_count: post.metrics.retweetCount,
    },
  }));
