/**
 * Returns a short relative time string (e.g. "now", "5m", "2h", "3d") or full date.
 */
export const formatRelativeTime = (
  created_at: string | undefined,
): string | null => {
  if (created_at == null) return null;

  const d = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffM < 1) return "now";
  if (diffM < 60) return `${diffM}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString();
};
