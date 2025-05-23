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

export const pivotMealMatrix = (
  data: MealMatrixEntry[],
  mealTypes: MealType[],
): MatrixRow[] => {
  const map = new Map<string, MatrixRow>();

  data.forEach((entry) => {
    const { treatmentClass, mealType, mealCount } = entry;

    if (!map.has(treatmentClass)) {
      map.set(treatmentClass, { treatmentClass });
    }

    const row = map.get(treatmentClass)!;
    row[mealType] = parseInt(mealCount, 10);
  });

  const result = Array.from(map.values()).map((row) => {
    mealTypes.forEach((type) => {
      if (!(type.code in row)) {
        row[type.code] = 0;
      }
    });

    // Calculate the total for each row (treatment class)
    const total = mealTypes.reduce((sum, type) => {
      return sum + (Number(row[type.code]) || 0); // Explicitly convert to number
    }, 0);

    // Add total to the row
    row["total"] = total;
    return row;
  });

  return result;
};
