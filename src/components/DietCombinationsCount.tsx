import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { format } from "date-fns";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { id } from "date-fns/locale";

interface DietCombinationsCountProps {
  date: Date;
  dailyData: DailyPatientMeal[];
}

const DietCombinationsCount = ({
  date,
  dailyData,
}: DietCombinationsCountProps) => {
  const [dietCombinations, setDietCombinations] = useState<
    DietCombinationCount[]
  >([]);
  const [dietTypeCount, setDietTypeCount] = useState({
    complication: 0,
    nonComplication: 0,
  });

  useEffect(() => {
    const fetchDietCombinations = async () => {
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const res = await api.get(
          `daily-patient-meal/count/diet?date=${formattedDate}`,
        );
        setDietCombinations(
          (res.data.data.combinationsCount ?? []) as DietCombinationCount[],
        );
        setDietTypeCount({
          complication: res.data.data.complicationCount,
          nonComplication: res.data.data.nonComplicationCount,
        });
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err));
        }
        console.error(err);
      }
    };
    fetchDietCombinations();
  }, [date, dailyData]);

  return (
    dietCombinations?.length !== 0 && (
      <Card className="flex w-fit flex-col justify-between gap-y-2 px-4 py-4">
        <p>
          Rekap Diet -{" "}
          <span className="bg-primary rounded-sm p-1 font-bold">
            {format(date, "PPP", { locale: id })}
          </span>
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Diet</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {dietCombinations?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.dietCodes}</TableCell>
                <TableCell>{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="text-end text-sm">
          <p>Komplikasi: {dietTypeCount.complication}</p>
          <p>Non-komplikasi: {dietTypeCount.nonComplication}</p>
        </div>
      </Card>
    )
  );
};

export default DietCombinationsCount;
