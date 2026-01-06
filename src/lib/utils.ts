import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format file size in bytes to human-readable string
 *
 * Converts byte values to appropriate units (B, KB, MB) with
 * one decimal place precision for KB and MB.
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "234 KB", "89 B")
 *
 * @example
 * formatFileSize(500) // "500 B"
 * formatFileSize(2048) // "2.0 KB"
 * formatFileSize(1536000) // "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
