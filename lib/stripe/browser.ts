"use client";

import { loadStripe } from "@stripe/stripe-js";

// Loaded once at module scope, otherwise every render re-downloads Stripe.js.
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);
