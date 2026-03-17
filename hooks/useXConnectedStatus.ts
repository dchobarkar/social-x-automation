"use client";

import { useCallback, useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";

export const useXConnectedStatus = (): {
  connected: boolean | null;
  refresh: () => Promise<void>;
} => {
  const [connected, setConnected] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API_AUTH_X_STATUS);
      const data = (await res.json()) as { connected?: boolean };
      setConnected(data.connected === true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { connected, refresh };
};
