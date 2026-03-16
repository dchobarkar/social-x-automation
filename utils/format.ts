/**
 * Format follower count for display (e.g. 1500 → "1.5K", 100 → "100").
 */
export const formatFollowers = (count: number): string =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();
