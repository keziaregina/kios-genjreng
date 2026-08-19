type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  check: (key: string) => { allowed: boolean; retryAfterMinutes: number };
  record: (key: string) => void;
  clear: (key: string) => void;
};

// One shared shape for every in-memory counter so features do not copy the bucket logic.
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const buckets = new Map<string, Bucket>();

  function current(key: string, now: number): Bucket | null {
    const bucket = buckets.get(key);
    if (!bucket) return null;

    if (bucket.resetAt <= now) {
      buckets.delete(key);
      return null;
    }

    return bucket;
  }

  return {
    check(key) {
      const now = Date.now();
      const bucket = current(key, now);

      if (!bucket || bucket.count < limit) {
        return { allowed: true, retryAfterMinutes: 0 };
      }

      return {
        allowed: false,
        retryAfterMinutes: Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000)),
      };
    },

    record(key) {
      const now = Date.now();
      const bucket = current(key, now);

      if (!bucket) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }

      bucket.count += 1;
    },

    clear(key) {
      buckets.delete(key);
    },
  };
}
