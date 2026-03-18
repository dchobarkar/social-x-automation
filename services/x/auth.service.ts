import { getTokens } from "@/lib/storage/tokenStore";

export const getXConnectedStatus = async (): Promise<{
  connected: boolean;
  accessExpiresAt?: number;
}> => {
  const tokens = await getTokens();
  if (!tokens?.access_token) return { connected: false };

  return { connected: true, accessExpiresAt: tokens.expires_at };
};
