"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MenuPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);

  useEffect(() => {
    const fetchMealType = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/meal-type`,
        );
        setMealTypes(res.data.data as MealType[]);
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    };
    fetchMealType();
  }, []);
  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <DateTimePicker
        value={date}
        onChange={setDate}
        className="w-[250px]"
        granularity="day"
      />

      <div className="flex gap-5">
        {mealTypes.map((mt) => (
          <Card key={mt.name} className="w-[350px]">
            <CardHeader>
              <CardTitle>{mt.code}</CardTitle>
              <CardDescription>{mt.name}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
