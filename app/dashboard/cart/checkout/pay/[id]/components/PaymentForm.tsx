"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { paymentAppearance } from "@/lib/stripe/appearance";
import { stripePromise } from "@/lib/stripe/browser";
import { formatPrice } from "@/lib/utils";

type PaymentFormProps = { clientSecret: string; total: number };

const ConfirmButton = ({ total }: { total: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    if (!stripe || !elements) return;

    setPending(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/cart/checkout/return`,
      },
    });

    // A success leaves the page for return_url, so only a failure ever gets here.
    setPending(false);
    if (error) toast.error(error.message ?? "Pembayaran gagal");
  };

  return (
    <Button type="button" disabled={pending} onClick={handleConfirm}>
      {pending ? "Memproses..." : `Bayar · ${formatPrice(total)}`}
    </Button>
  );
};

// The Element needs the intent before it can render, so the page fetches the secret and this only mounts under it.
const PaymentForm = ({ clientSecret, total }: PaymentFormProps) => (
  <Elements
    stripe={stripePromise}
    options={{ clientSecret, appearance: paymentAppearance }}
  >
    <div className="flex flex-col gap-[21px]">
      <PaymentElement />
      <ConfirmButton total={total} />
    </div>
  </Elements>
);

export default PaymentForm;
