/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import axios from "axios";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DailyPatientMealForm from "@/components/DailyPatientMealForm";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

const HomePage = () => {
  const isMobile = useIsMobile();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [roomType, setRoomType] = useState<number>(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [data, setData] = useState<DailyPatientMeal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDailyMeal, setSelectedDailyMeal] = useState<
    DailyPatientMeal | undefined
  >();

  useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        let res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/room-type`,
        );
        setRoomTypes(res.data.data as RoomType[]);

        res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/meal-type`,
        );
        setMealTypes(res.data.data as MealType[]);
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    };
    fetchRequiredData();
  }, []);

  useEffect(() => {
    const fetchRoomsBasedOnRoomType = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/room/filter?roomType=${roomType}`,
      );
      setRooms(res.data.data as Room[]);
    };
    fetchRoomsBasedOnRoomType();
  }, [roomType]);

  const fetchFilteredData = async () => {
    try {
      if (!date) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/filter?date=${formattedDate}&roomType=${roomType}`;
      const res = await axios.get(url);
      console.log(url);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  useEffect(() => {
    if (!date || !roomType) return;
    fetchFilteredData();
  }, [date, roomType]);

  const columnHelper = createColumnHelper<DailyPatientMeal>();
  const columns: ColumnDef<DailyPatientMeal>[] = [
    columnHelper.accessor("patient.medicalRecordNumber", {
      id: "medicalRecordNumber",
      header: "Nomor MR",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("patient.name", {
      id: "patientName",
      header: "Nama Pasien",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("patient.dateOfBirth", {
      id: "patientDateOfBirth",
      header: "Tanggal Lahir",
      cell: (info) => {
        const rawDate = info.getValue();
        return rawDate ? format(new Date(rawDate), "PPP", { locale: id }) : "-";
      },
    }),
    columnHelper.accessor("room.roomNumber", {
      id: "roomNumber",
      header: "Nomor Kamar",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("room.treatmentClass", {
      id: "treatmentClass",
      header: "Kelas Perawatan",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("mealType.name", {
      id: "mealTypeName",
      header: "Jenis Makanan",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Updated At",
      cell: (info) => info.getValue(),
    }),
  ] as ColumnDef<DailyPatientMeal>[];

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: {
        updatedAt: false,
      },
    },
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <div className="flex gap-x-8">
        <DatePicker value={date} onChange={setDate} />

        <Select
          value={String(roomType)}
          onValueChange={(val) => setRoomType(Number(val))}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Jenis Ruangan..." />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map((room) => (
              <SelectItem key={room.id} value={room.id.toString()}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {roomType && (
        <Button
          className="w-[150px]"
          onClick={() => {
            setSelectedDailyMeal(undefined);
            setDialogOpen(true);
          }}
        >
          Tambah Entri
        </Button>
      )}
      {!roomType && <p>Silahkan pilih tanggal dan tipe ruangan</p>}
      {roomType && data.length === 0 && <p>Tidak ada data</p>}

      {roomType && data.length > 0 && (
        <Table>
          <TableCaption>Tes</TableCaption>

          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => {
                  setSelectedDailyMeal(row.original);
                  setDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} suppressHydrationWarning>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {selectedDailyMeal
                  ? "Edit Permintaan Makanan"
                  : "Tambah Permintaan Makanan"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DailyPatientMealForm
              rooms={rooms}
              mealTypes={mealTypes}
              initialData={selectedDailyMeal}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDailyMeal(undefined);
                fetchFilteredData();
              }}
              className="px-4"
            />
            <DrawerFooter className="pt-2">
              {/* <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose> */}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDailyMeal
                  ? "Edit Permintaan Makanan"
                  : "Tambah Permintaan Makanan"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <DailyPatientMealForm
              rooms={rooms}
              mealTypes={mealTypes}
              initialData={selectedDailyMeal}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDailyMeal(undefined);
                fetchFilteredData();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HomePage;
