import { createRateLimiter } from "@/lib/rate-limit";

// In-memory and per process — enough to slow down local brute force, not a production limiter.
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

export function checkLoginAttempts(key: string): {
  allowed: boolean;
  retryAfterMinutes: number;
} {
  return loginLimiter.check(key);
}

export function recordLoginFailure(key: string): void {
  loginLimiter.record(key);
}

export function clearLoginFailures(key: string): void {
  loginLimiter.clear(key);
}
