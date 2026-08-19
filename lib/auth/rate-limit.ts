const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

type Bucket = { failures: number; resetAt: number };

// In-memory and per process — enough to slow down local brute force, not a production limiter.
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

export function checkLoginAttempts(key: string): {
  allowed: boolean;
  retryAfterMinutes: number;
} {
  const now = Date.now();
  const bucket = current(key, now);

  if (!bucket || bucket.failures < MAX_FAILURES) {
    return { allowed: true, retryAfterMinutes: 0 };
  }

  return {
    allowed: false,
    retryAfterMinutes: Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000)),
  };
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const bucket = current(key, now);

  if (!bucket) {
    buckets.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }

  bucket.failures += 1;
}

export function clearLoginFailures(key: string): void {
  buckets.delete(key);
}
