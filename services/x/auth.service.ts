import { getTokens } from "@/lib/tokenStore";
import { refreshTokens } from "@/integrations/x/auth";

export const getXConnectedStatus = async (): Promise<{
  connected: boolean;
  accessExpiresAt?: number;
}> => {
  const tokens = await getTokens();
  if (!tokens?.access_token) return { connected: false };

  return { connected: true, accessExpiresAt: tokens.expires_at };
};

export const refreshXTokens = async (): Promise<void> => {
  await refreshTokens();
};
