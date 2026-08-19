"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { IMAGE_ACCEPT, validateImageFile } from "@/lib/upload/limits";

type ImageFieldProps = {
  file: File | null;
  existingUrl: string | null;
  onChange: (file: File | null) => void;
  onClear: () => void;
  onReject: (message: string | null) => void;
  error?: string | null;
};

const ImageField = ({
  file,
  existingUrl,
  onChange,
  onClear,
  onReject,
  error,
}: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Object URLs leak until revoked, so the preview is torn down with the file that made it.
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = objectUrl ?? existingUrl;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    if (!picked) return;

    const invalid = validateImageFile(picked);
    if (invalid) {
      onReject(invalid);
      onChange(null);
      event.target.value = "";
      return;
    }

    onReject(null);
    onChange(picked);
  };

  // Clearing the input's value is what lets the merchant re-pick the very same file.
  const handleRemove = () => {
    onClear();
    onReject(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="image" className="text-text-secondary text-xs font-semibold">
        Foto produk
      </label>

      <div className="relative">
        <label
          htmlFor="image"
          className="border-divider has-[:focus-visible]:ring-button-primary/40 flex h-[218px] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[10px] border-2 border-dashed has-[:focus-visible]:ring-2"
        >
          {preview ? (
            // The optimizer cannot fetch a blob: URL, so only a fresh pick opts out of it.
            <Image
              src={preview}
              alt="Pratinjau foto produk"
              fill
              sizes="100vw"
              unoptimized={Boolean(objectUrl)}
              className="object-cover"
            />
          ) : (
            <>
              <ImagePlus className="text-text-secondary" size={28} />
              <span className="text-text-secondary text-sm font-semibold">
                Ketuk untuk unggah foto
              </span>
              <span className="text-text-secondary text-[11px]">
                JPG, PNG, atau WEBP · maks 2MB
              </span>
            </>
          )}

          <input
            ref={inputRef}
            id="image"
            name="image"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleChange}
            className="sr-only"
          />
        </label>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus foto"
            className="bg-primary/70 text-text-primary absolute top-2 right-2 rounded-full p-2"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default ImageField;
