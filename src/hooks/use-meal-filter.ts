import { create } from "zustand";
import { persist } from "zustand/middleware";

type MealFilterState = {
  date: string;
  roomType: number | undefined;
  setDate: (date: Date | undefined) => void;
  setRoomType: (roomType: number | undefined) => void;
};

export const useMealFilterStore = create<MealFilterState>()(
  persist(
    (set) => ({
      date: new Date().toISOString(),
      roomType: undefined,
      setDate: (date) => set({ date: date?.toISOString() }),
      setRoomType: (roomType) => set({ roomType }),
    }),
    {
      name: "meal-filter-storage",
    },
  ),
);
