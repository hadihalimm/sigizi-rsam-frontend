/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { format } from "date-fns";
import {
  Table,
  TableBody,
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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { pivotMealMatrix } from "@/lib/utils";

const HomePage = () => {
  const isMobile = useIsMobile();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [roomType, setRoomType] = useState<number>(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [data, setData] = useState<DailyPatientMeal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDailyMeal, setSelectedDailyMeal] = useState<
    DailyPatientMeal | undefined
  >();
  const [matrixMealCount, setMatrixMealCount] = useState<MatrixRow[]>([]);
  const [matrixMealCountAll, setMatrixMealCountAll] = useState<MatrixRow[]>([]);

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

        res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diet`);
        setDiets(res.data.data as Diet[]);
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
      setData(res.data.data as DailyPatientMeal[]);
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  const fetchCountData = async () => {
    try {
      if (!date || mealTypes.length === 0) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/count?date=${formattedDate}&roomType=${roomType}`;
      let res = await axios.get(url);
      setMatrixMealCount(
        pivotMealMatrix(res.data.data as MealMatrixEntry[], mealTypes),
      );

      url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/count?date=${formattedDate}&roomType=`;
      res = await axios.get(url);
      setMatrixMealCountAll(
        pivotMealMatrix(res.data.data as MealMatrixEntry[], mealTypes),
      );
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  useEffect(() => {
    if (!date || !roomType) return;
    fetchFilteredData();
    fetchCountData();
  }, [date, roomType, mealTypes]);

  const columnHelper = createColumnHelper<DailyPatientMeal>();
  const columns: ColumnDef<DailyPatientMeal>[] = [
    columnHelper.accessor("patient.medicalRecordNumber", {
      id: "medicalRecordNumber",
      header: "Nomor MR",
      cell: (info) => info.getValue(),
      size: 90,
    }),
    columnHelper.accessor("patient.name", {
      id: "patientName",
      header: "Nama Pasien",
      cell: (info) => info.getValue(),
      size: 150,
    }),
    columnHelper.accessor("patient.dateOfBirth", {
      id: "patientDateOfBirth",
      header: "Tanggal Lahir",
      cell: (info) => {
        const rawDate = info.getValue();
        return rawDate ? format(new Date(rawDate), "PPP", { locale: id }) : "-";
      },
      size: 120,
    }),
    columnHelper.accessor("room.roomNumber", {
      id: "roomNumber",
      header: "No. Kamar",
      cell: (info) => info.getValue(),
      size: 70,
    }),
    columnHelper.accessor("room.treatmentClass", {
      id: "treatmentClass",
      header: "Kelas Perawatan",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("mealType.code", {
      id: "mealTypeCode",
      header: "Jenis Makanan",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("diets", {
      id: "diets",
      header: "Diet",
      cell: (info) =>
        info
          .getValue()
          .map((diet) => diet.code)
          .join(", "),
      size: 100,
    }),
    columnHelper.accessor("patient.allergies", {
      id: "patientAllergies",
      header: "Alergi",
      cell: (info) =>
        info
          .getValue()
          .map((allergy) => allergy.code)
          .join(", "),
      size: 100,
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Updated At",
      cell: (info) => info.getValue(),
      sortingFn: "datetime",
    }),
  ] as ColumnDef<DailyPatientMeal>[];

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        updatedAt: false,
      },
      sorting: [
        {
          id: "updatedAt",
          desc: true,
        },
      ],
    },
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <div className="flex gap-x-8">
        <DateTimePicker
          value={date}
          onChange={setDate}
          className="w-[250px]"
          granularity="day"
        />
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

      {(!date || !roomType) && <p>Silahkan pilih tanggal dan tipe ruangan</p>}
      {date && roomType && data.length === 0 && <p>Tidak ada data</p>}

      {roomType && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className="truncate whitespace-normal"
                  style={{
                    width: `${header.getSize()}px`,
                    minWidth: `${header.getSize()}px`,
                    maxWidth: `${header.getSize()}px`,
                  }}
                >
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
              diets={diets}
              initialData={selectedDailyMeal}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDailyMeal(undefined);
                fetchFilteredData();
                fetchCountData();
              }}
              className="px-4"
            />
            <DrawerFooter className="pt-2"></DrawerFooter>
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
              diets={diets}
              initialData={selectedDailyMeal}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDailyMeal(undefined);
                fetchFilteredData();
                fetchCountData();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {date && roomType && matrixMealCount.length > 0 && (
        <div className="mt-8 flex flex-col">
          <p>
            Rekapitulasi Permintaan Makanan{" "}
            <span className="bg-secondary rounded-sm p-1 font-bold">
              {roomTypes.find((rt) => rt.id === roomType)?.name}
            </span>{" "}
            - {format(date, "PPP", { locale: id })}
          </p>

          <Table className="w-1/3">
            <TableHeader>
              <TableRow>
                <TableHead className="truncate whitespace-normal">
                  Kelas Perawatan
                </TableHead>
                {mealTypes.map((mt) => (
                  <TableHead key={mt.id}>{mt.code}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {matrixMealCount.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.treatmentClass}</TableCell>
                  {mealTypes.map((mt) => (
                    <TableCell key={`${row.treatmentClass}-${mt.code}`}>
                      {row[mt.code] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {date && roomType && matrixMealCountAll.length > 0 && (
        <div className="flex flex-col">
          <p>
            Rekapitulasi Permintaan Makanan{" "}
            <span className="bg-secondary rounded-sm p-1 font-bold">
              Semua Ruangan
            </span>{" "}
            - {format(date, "PPP", { locale: id })}
          </p>

          <Table className="w-1/3">
            <TableHeader>
              <TableRow>
                <TableHead>Kelas Perawatan</TableHead>
                {mealTypes.map((mt) => (
                  <TableHead key={mt.id}>{mt.code}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {matrixMealCountAll.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.treatmentClass}</TableCell>
                  {mealTypes.map((mt) => (
                    <TableCell key={`${row.treatmentClass}-${mt.code}`}>
                      {row[mt.code] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default HomePage;
