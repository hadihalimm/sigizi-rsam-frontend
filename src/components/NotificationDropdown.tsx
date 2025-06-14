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
import api from "@/lib/axios";

interface NotificationDropdownProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  date: Date;
  roomType: number;
  roomTypes: RoomType[];
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
  roomTypes,
  rooms,
  mealTypes,
  diets,
  dailyData,
  className,
}: NotificationDropdownProps) => {
  const [logs, setLogs] = useState<DailyPatientMealLog[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchLogs = async () => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await api.get(
        `daily-patient-meal/logs?date=${formattedDate}&roomType=${roomType}`,
      );
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

  useEffect(() => {
    const lastSeen = localStorage.getItem("notificationLastSeen");
    const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
    const hasNew = logs.some((log) => {
      const changedDate = new Date(log.changedAt);
      return !lastSeenDate || changedDate > lastSeenDate;
    });
    setHasUnread(hasNew);
  }, [logs]);

  useEffect(() => {
    if (open) {
      const now = new Date().toISOString();
      localStorage.setItem("notificationLastSeen", now);
      setHasUnread(false);
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="relative">
          <Bell />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="h-[400px] w-[300px] overflow-x-scroll"
        align="end"
      >
        <DropdownMenuLabel>
          Update Logs{" - "}
          {format(date, "d MMMM yyyy", {
            locale: id,
          })}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="space-y-4 px-2">
          {logs.length == 0 ? (
            <DropdownMenuItem>Tidak ada data</DropdownMenuItem>
          ) : (
            logs.map((log) => {
              return (
                <DropdownMenuItem key={log.id} className="flex flex-col">
                  <span className="font-bold">
                    {log.patientName} - {log.patientMRN} - {log.roomTypeName} -{" "}
                    {log.roomName}
                  </span>
                  <span className="font-medium">
                    {renderLogDetail(log, mealTypes, roomTypes, rooms, diets)}
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
  roomTypes: RoomType[],
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

    case "RoomType": {
      return (
        <p>
          Bangsal:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">
            {log.oldValue}
          </span>{" "}
          &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{log.newValue}</span>
        </p>
      );
    }

    case "RoomID": {
      return (
        <p>
          Kamar:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">
            {log.oldValue}
          </span>{" "}
          &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{log.newValue}</span>
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

    case "Notes": {
      return (
        <p>
          Notes:&nbsp;&nbsp;
          <span className="bg-secondary rounded-sm p-1">{log.oldValue}</span>
          &rarr;{" "}
          <span className="bg-primary rounded-sm p-1">{log.newValue}</span>
        </p>
      );
    }
  }
};

export default NotificationDropdown;
