export type JsonRecord = Record<string, unknown>;

export const safeJson = async <T>(
  res: Response,
  fallback: T,
): Promise<T> => {
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
};

export const postJson = async <TResponse>(
  url: string,
  body: JsonRecord,
  init?: Omit<RequestInit, "method" | "headers" | "body">,
): Promise<{ res: Response; data: TResponse }> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  const data = await safeJson<TResponse>(res, {} as TResponse);
  return { res, data };
};

