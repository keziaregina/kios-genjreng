import Stripe from "stripe";

// Fail loudly instead of sending an unauthenticated request on every checkout.
function secretKey(): string {
  const raw = process.env.STRIPE_SECRET_KEY;
  if (!raw) throw new Error("STRIPE_SECRET_KEY is missing");
  return raw;
}

// The webhook secret is per environment, so it is read where it is used rather than at import time.
export function webhookSecret(): string {
  const raw = process.env.STRIPE_WEBHOOK_SECRET;
  if (!raw) throw new Error("STRIPE_WEBHOOK_SECRET is missing");
  return raw;
}

// Cached on globalThis like lib/prisma.ts, but built on first call so a missing key breaks checkout, not every import.
const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

export function stripe(): Stripe {
  globalForStripe.stripe ??= new Stripe(secretKey(), { typescript: true });
  return globalForStripe.stripe;
}

// Stripe bills IDR in sen: it is a two-decimal currency, so whole rupiah scale by 100.
export function toStripeAmount(rupiah: number) {
  return rupiah * 100;
}
