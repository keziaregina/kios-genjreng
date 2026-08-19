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

// Marketplace listings round sales into a badge, so 40000 reads as "40rb+" instead of a raw count.
export function formatSold(soldCount: number) {
  if (soldCount < 1000) return String(soldCount)
  const thousands = (soldCount / 1000).toFixed(1).replace(/\.0$/, "").replace(".", ",")
  return `${thousands}rb+`
}
