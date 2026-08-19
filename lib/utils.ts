import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

// Every screen quotes rupiah the same way, so the formatter lives in one place.
export function formatPrice(price: number) {
  return priceFormatter.format(price)
}
