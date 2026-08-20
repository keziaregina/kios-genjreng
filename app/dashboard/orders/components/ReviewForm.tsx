"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { submitReview } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { MAX_COMMENT_LENGTH } from "@/lib/reviews";

import StarInput from "./StarInput";

type ReviewFormValues = { comment: string };

type ReviewFormProps = {
  orderId: number;
  productId: number;
  productName: string;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full resize-none rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

// Stars cannot ride react-hook-form's register, so the rating stays local state beside the registered textarea.
const ReviewForm = ({ orderId, productId, productName }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({ defaultValues: { comment: "" } });

  const onSubmit = handleSubmit(async (values) => {
    if (rating === 0) {
      setServerError("Pilih bintang dulu");
      return;
    }

    setServerError(null);

    const result = await submitReview({
      orderId,
      productId,
      rating,
      comment: values.comment,
    });

    if (!result.ok) setServerError(result.message);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="border-divider flex flex-col gap-3 rounded-xl border px-4 py-3"
    >
      <p className="text-text-primary truncate text-sm font-semibold">
        {productName}
      </p>

      <StarInput value={rating} onChange={setRating} disabled={isSubmitting} />

      <textarea
        {...register("comment", {
          maxLength: {
            value: MAX_COMMENT_LENGTH,
            message: `Ulasan maksimal ${MAX_COMMENT_LENGTH} karakter`,
          },
        })}
        rows={3}
        placeholder="Ceritakan pengalamanmu (opsional)"
        className={fieldClass}
      />
      {errors.comment && (
        <p className="text-button-primary text-xs">{errors.comment.message}</p>
      )}
      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="sm" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
      </Button>
    </form>
  );
};

export default ReviewForm;
