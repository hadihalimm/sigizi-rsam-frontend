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

export const formatRupiah = (value: string): string => {
  const numberString = value.replace(/[^,\d]/g, "");
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  return rupiah;
};
