import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combines conditional class names (clsx) and resolves Tailwind conflicts
// between them (twMerge) — e.g. cn("p-2", isActive && "p-4") correctly
// keeps only "p-4" instead of leaving both "p-2 p-4" in the output.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
