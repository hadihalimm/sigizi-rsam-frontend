/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { id } from "date-fns/locale";

interface NotificationDropdownProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  date: Date;
  roomType: number;
  rooms: Room[];
  mealTypes: MealType[];
  diets: Diet[];
  dailyData: DailyPatientMeal[];
  className?: string;
}

const NotificationDropdown = ({
  open,
  setOpen,
  date,
  roomType,
  rooms,
  mealTypes,
  diets,
  dailyData,
  className,
}: NotificationDropdownProps) => {
  const [logs, setLogs] = useState<DailyPatientMealLog[]>([]);

  const fetchLogs = async () => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/logs?date=${formattedDate}&roomType=${roomType}`;
      const res = await axios.get(url);
      setLogs(res.data.data as DailyPatientMealLog[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err));
      }
      console.error(err);
    }
  };
  useEffect(() => {
    fetchLogs();
  }, [dailyData]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon">
          <Bell />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="h-[400px] w-[300px]">
        <DropdownMenuLabel>Update Logs</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="space-y-4 px-2">
          {logs.length == 0 ? (
            <DropdownMenuItem>Tidak ada data</DropdownMenuItem>
          ) : (
            logs.map((log) => {
              return (
                <DropdownMenuItem key={log.id} className="flex flex-col">
                  <span className="font-bold">
                    {log.patientName} - {log.patientMRN} - {log.roomNumber}
                  </span>
                  <span className="font-medium">
                    {renderLogDetail(log, mealTypes, rooms, diets)}
                  </span>
                  <span className="text-xs font-extralight">
                    {format(new Date(log.changedAt), "d MMMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const renderLogDetail = (
  log: DailyPatientMealLog,
  mealTypes: MealType[],
  rooms: Room[],
  diets: Diet[],
) => {
  switch (log.field) {
    case "MealTypeID": {
      const oldValue =
        mealTypes.find((mt) => mt.id === Number(log.oldValue))?.code ?? "-";
      const newValue =
        mealTypes.find((mt) => mt.id === Number(log.newValue))?.code ?? "-";
      return (
        <p>
          Jenis makanan:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">
            {oldValue}
          </span> &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{newValue}</span>
        </p>
      );
    }

    case "RoomID": {
      const oldValue =
        rooms.find((room) => room.id === Number(log.oldValue))?.roomNumber ??
        "-";
      const newValue =
        rooms.find((room) => room.id === Number(log.newValue))?.roomNumber ??
        "-";
      return (
        <p>
          Nomor kamar:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">
            {oldValue}
          </span> &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{newValue}</span>
        </p>
      );
    }

    case "Diets": {
      const oldIDs = log.oldValue.split(",");
      const newIDs = log.newValue.split(",");

      const oldNames = oldIDs
        .map((id) => diets.find((diet) => diet.id === Number(id))?.code || `$`)
        .join("");
      const newNames = newIDs
        .map((id) => diets.find((diet) => diet.id === Number(id))?.code || `$`)
        .join("");

      return (
        <p>
          Diets:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">
            {oldNames}
          </span> &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{newNames}</span>
        </p>
      );
    }
  }
};

export default NotificationDropdown;
