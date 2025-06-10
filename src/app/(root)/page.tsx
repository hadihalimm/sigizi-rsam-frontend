/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { isAxiosError } from "axios";
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
import { cn, pivotMealMatrix } from "@/lib/utils";
import { Download } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import DietCombinationsCount from "@/components/DietCombinationsCount";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMealFilterStore } from "@/hooks/use-meal-filter";

const HomePage = () => {
  const isMobile = useIsMobile();
  // const [date, setDate] = useState<Date | undefined>(new Date());
  // const [roomType, setRoomType] = useState<number | undefined>();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [data, setData] = useState<DailyPatientMeal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDailyMeal, setSelectedDailyMeal] = useState<
    DailyPatientMeal | undefined
  >();
  const [matrixMealCount, setMatrixMealCount] = useState<MatrixRow[]>([]);
  const [matrixMealCountAll, setMatrixMealCountAll] = useState<MatrixRow[]>([]);
  const [openDropdownLog, setOpenDropdownLog] = useState(false);

  const { date, setDate, roomType, setRoomType } = useMealFilterStore();

  useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        let res = await api.get("/room-type");
        setRoomTypes(res.data.data as RoomType[]);

        res = await api.get("/meal-type");
        setMealTypes(res.data.data as MealType[]);

        res = await api.get("/diet");
        setDiets(res.data.data as Diet[]);

        res = await api.get("/allergy");
        setAllergies(res.data.data as Allergy[]);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
        console.error(err);
      }
    };
    fetchRequiredData();
  }, []);

  useEffect(() => {
    if (!roomType) return;
    const fetchRoomsBasedOnRoomType = async () => {
      try {
        const res = await api.get(`/room/filter?roomType=${roomType}`);
        setRooms(res.data.data as Room[]);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
        console.error(err);
      }
    };
    fetchRoomsBasedOnRoomType();
  }, [roomType]);

  const fetchFilteredData = async () => {
    try {
      if (!date) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await api.get(
        `/daily-patient-meal/filter?date=${formattedDate}&roomType=${roomType}`,
      );
      setData(res.data.data as DailyPatientMeal[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const fetchCountData = async () => {
    try {
      if (!date || mealTypes.length === 0) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      let res = await api.get(
        `/daily-patient-meal/count?date=${formattedDate}&roomType=${roomType}`,
      );
      setMatrixMealCount(
        pivotMealMatrix(res.data.data as MealMatrixEntry[], mealTypes),
      );

      res = await api.get(
        `/daily-patient-meal/count?date=${formattedDate}&roomType=`,
      );
      setMatrixMealCountAll(
        pivotMealMatrix(res.data.data as MealMatrixEntry[], mealTypes),
      );
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const handleDownloadSpreadsheet = async () => {
    try {
      if (!date) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/export?date=${formattedDate}`;
      window.location.href = url;
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
      size: 85,
    }),
    columnHelper.accessor("patient.name", {
      id: "patientName",
      header: "Nama Pasien",
      cell: (info) =>
        info
          .getValue()
          .replace(/(?:^|[\s.])\w/g, (match) => match.toUpperCase())
          .replace(/\s+/g, " "),
      size: 150,
    }),
    columnHelper.accessor("patient.dateOfBirth", {
      id: "patientDateOfBirth",
      header: "Tanggal Lahir",
      cell: (info) => {
        const rawDate = info.getValue();
        return rawDate ? format(new Date(rawDate), "PPP", { locale: id }) : "-";
      },
      size: 140,
    }),
    columnHelper.accessor("room.name", {
      id: "name",
      header: "No. Kamar",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("room.treatmentClass", {
      id: "treatmentClass",
      header: "Kelas Perawatan",
      cell: (info) => info.getValue(),
      size: 90,
    }),
    columnHelper.accessor("mealType.code", {
      id: "mealTypeCode",
      header: "Jenis Makanan",
      cell: (info) => info.getValue(),
      size: 80,
    }),
    columnHelper.accessor("diets", {
      id: "diets",
      header: "Diet",
      cell: (info) =>
        info
          .getValue()
          .map((diet) => diet.code)
          .join(", "),
      size: 230,
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
    columnHelper.accessor("notes", {
      id: "notes",
      header: "Catatan",
      cell: (info) => info.getValue(),
      size: 90,
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Updated At",
      cell: (info) => info.getValue(),
      sortingFn: "datetime",
    }),
    columnHelper.display({
      id: "combinedFilter",
      filterFn: (row, columnId, filterValue: string) => {
        const mrn = row.original.patient.medicalRecordNumber.toLowerCase();
        const name = row.original.patient.name.toLowerCase();
        const query = filterValue.toLowerCase();
        return mrn.includes(query) || name.includes(query);
      },
    }),
  ] as ColumnDef<DailyPatientMeal>[];

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        updatedAt: false,
        combinedFilter: false,
      },
      sorting: [
        {
          id: "updatedAt",
          desc: true,
        },
      ],
    },
    // state: {
    //   columnFilters,
    // },
    // onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="mt-2 mb-8 flex w-full flex-col gap-y-5 px-4">
      <Card className="px-4 py-4">
        <h1 className="text-foreground w-fit rounded-sm py-1 text-2xl font-bold">
          Tabel Permintaan Makanan
        </h1>
        <div className="flex gap-x-8">
          <Label className="flex flex-col gap-y-1">
            <p className="text-foreground pl-1 text-sm">Tanggal</p>
            <DateTimePicker
              value={new Date(date)}
              onChange={setDate}
              className="w-[250px]"
              granularity="day"
              yearRange={10}
            />
          </Label>
          <Label className="flex flex-col gap-y-1">
            <p className="text-foreground pl-1 text-sm">Bangsal</p>
            <Select
              value={roomType !== undefined ? String(roomType) : undefined}
              onValueChange={(val) => setRoomType(Number(val))}
            >
              <SelectTrigger className="w-[250px]">
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
          </Label>
        </div>

        {(!date || !roomType) && <p>Silahkan pilih tanggal dan tipe ruangan</p>}
        {date && roomType && data.length === 0 && <p>Tidak ada data</p>}

        {roomType && (
          <div className="flex justify-between gap-x-4">
            <div className="flex gap-x-4">
              <Button
                className="w-[150px]"
                onClick={() => {
                  setSelectedDailyMeal(undefined);
                  setDialogOpen(true);
                }}
              >
                Tambah Entri
              </Button>

              <Input
                type="text"
                className="w-[365px]"
                placeholder="Cari data..."
                value={
                  (table
                    .getColumn("combinedFilter")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn("combinedFilter")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>
            <NotificationDropdown
              open={openDropdownLog}
              setOpen={setOpenDropdownLog}
              date={new Date(date!)}
              roomType={roomType}
              roomTypes={roomTypes}
              rooms={rooms}
              mealTypes={mealTypes}
              diets={diets}
              dailyData={data}
              className="ml-auto"
            />
          </div>
        )}

        {roomType && data.length > 0 && (
          <div className="border-primary/70 overflow-hidden rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  {table.getFlatHeaders().map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-primary/50 w-full truncate py-2 font-semibold whitespace-normal"
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
                    className={cn(
                      "cursor-pointer",
                      row.original.isNewlyAdmitted && "bg-orange-100/50",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        suppressHydrationWarning
                        className="truncate"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

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
            <ScrollArea className="overflow-y-auto">
              <DailyPatientMealForm
                currentDate={new Date(date) ?? new Date()}
                roomTypeID={roomType!}
                roomTypes={roomTypes}
                mealTypes={mealTypes}
                diets={diets}
                allergies={allergies}
                initialData={selectedDailyMeal}
                onSuccess={() => {
                  setDialogOpen(false);
                  setSelectedDailyMeal(undefined);
                  fetchFilteredData();
                  fetchCountData();
                }}
                className="px-4"
              />
            </ScrollArea>
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
              currentDate={new Date(date) ?? new Date()}
              roomTypeID={roomType!}
              roomTypes={roomTypes}
              mealTypes={mealTypes}
              diets={diets}
              allergies={allergies}
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

      <div className="flex justify-between gap-x-4 gap-y-4 max-md:flex-col">
        {date && roomType && matrixMealCount.length > 0 && (
          <Card className="flex w-fit flex-col gap-y-2 px-4 py-4">
            <p className="font-lg text-secondary-foreground text-lg font-semibold">
              Rekap Permintaan Makanan
            </p>
            <p>
              <span className="bg-primary w-fit rounded-sm p-1 text-lg font-bold">
                {roomTypes.find((rt) => rt.id === roomType)?.name}
              </span>
              {" - "}
              {format(date, "PPP", { locale: id })}
            </p>
            <div className="">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="truncate whitespace-normal">
                      Kelas Perawatan
                    </TableHead>
                    {mealTypes.map((mt) => (
                      <TableHead key={mt.id}>{mt.code}</TableHead>
                    ))}
                    <TableHead className="bg-primary/50 font-bold">
                      Total
                    </TableHead>
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
                      <TableCell className="bg-primary/50 font-bold">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {date && roomType && matrixMealCountAll.length > 0 && (
          <Card className="w-fit flex-[2] flex-col gap-y-2 px-4 py-4">
            <div className="flex items-center justify-between gap-x-4">
              <p className="text-secondary-foreground text-lg font-semibold">
                Rekap Permintaan Makanan{" "}
                <span className="bg-primary rounded-sm p-1 text-lg font-bold">
                  Semua Ruangan
                </span>{" "}
              </p>
              {format(date, "PPP", { locale: id })}

              <Button onClick={handleDownloadSpreadsheet}>
                <Download />
                Spreadsheet
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Kelas Perawatan</TableHead>
                  {mealTypes.map((mt) => (
                    <TableHead key={mt.id}>{mt.code}</TableHead>
                  ))}
                  <TableHead className="bg-primary/50 font-bold">
                    Total
                  </TableHead>
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
                    <TableCell className="bg-primary/50 font-bold">
                      {row.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
      {date && roomType && (
        <DietCombinationsCount date={new Date(date)} dailyData={data} />
      )}
    </div>
  );
};

export default HomePage;
