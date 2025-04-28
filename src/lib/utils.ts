import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePagination = (totalPages: number, currentPage: number) => {
  const visiblePages: (number | string)[] = [];
  const range = 1;

  for (let i = 0; i < totalPages; i++) {
    if (i >= currentPage - range && i <= currentPage + range) {
      visiblePages.push(i);
    } else if (visiblePages[visiblePages.length - 1] !== "...") {
      visiblePages.push("...");
    }
  }
  return visiblePages;
};
