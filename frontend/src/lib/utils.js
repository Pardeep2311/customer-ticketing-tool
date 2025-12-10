import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and twMerge for Tailwind class conflicts
 * 
 * @param {...any} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 * 
 * @example
 * cn("px-2 py-1", "bg-red-500", { "text-white": isActive })
 * cn("px-2", "px-4") // Returns "px-4" (last one wins)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

