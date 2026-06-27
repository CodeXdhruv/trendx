import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTickerIconUrl(ticker: string) {
  // Strip any exchange prefixes/suffixes if necessary, or just use the raw ticker
  const cleanTicker = ticker.split(/[:.]/)[0].toUpperCase();
  return `https://img.logo.dev/ticker/${cleanTicker}?token=pk_U0ryq2cpRQKlxRGCer9tSw`;
}
