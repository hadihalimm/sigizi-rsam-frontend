"use client";

import MealMenuForm from "@/components/MealMenuForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const days = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
];

export const time = ["pagi", "siang", "sore"];

const MealMenuPage = () => {
  const [mealMenus, setMealMenus] = useState<MealMenu[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealMenu, setSelectedMealMenu] = useState<
    MealMenu | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

  const fetchMealMenus = async () => {
    try {
      const res = await api.get("/meal-menu");
      setMealMenus(res.data.data as MealMenu[]);
      console.log(res.data.data);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await api.get("/food");
      setFoods(res.data.data as Food[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const fetchMealTypes = async () => {
    try {
      const res = await api.get("/meal-type");
      setMealTypes(res.data.data as MealType[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMealMenus();
    fetchFoods();
    fetchMealTypes();
  }, []);

  const columnHelper = createColumnHelper<MealMenu>();
  const columns: ColumnDef<MealMenu>[] = [
    columnHelper.accessor("id", {
      id: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      sortingFn: "textCaseSensitive",
    }),
    columnHelper.accessor("day", {
      id: "day",
      header: "Hari",
      cell: (info) => info.getValue(),
      sortingFn: (rowA, rowB, columnId) => {
        const dayA = rowA.getValue(columnId);
        const dayB = rowB.getValue(columnId);
        const indexA = days.indexOf(dayA as string);
        const indexB = days.indexOf(dayB as string);
        return indexA - indexB;
      },
    }),
    columnHelper.accessor("time", {
      id: "time",
      header: "Waktu",
      cell: (info) => info.getValue(),
      sortingFn: (rowA, rowB, columnId) => {
        const timeA = rowA.getValue(columnId);
        const timeB = rowB.getValue(columnId);
        const indexA = time.indexOf(timeA as string);
        const indexB = time.indexOf(timeB as string);
        return indexA - indexB;
      },
    }),
    columnHelper.accessor("mealType", {
      id: "mealType",
      header: "Jenis makanan",
      cell: (info) => info.getValue().code,
    }),
    columnHelper.accessor("foods", {
      id: "foods",
      header: "Daftar makanan",
      cell: (info) => (
        <ul className="list-disc gap-y-1">
          {info.getValue().map((food, index) => (
            <li key={index}>{food.name}</li>
          ))}
        </ul>
      ),
    }),
  ] as ColumnDef<MealMenu>[];

  const table = useReactTable({
    columns,
    data: mealMenus,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        id: false,
        updatedAt: false,
      },
      sorting: [
        {
          id: "name",
          desc: false,
        },
        {
          id: "day",
          desc: false,
        },
        {
          id: "time",
          desc: false,
        },
      ],
    },
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <Input
        type="text"
        className="w-1/2 max-md:w-full"
        placeholder="Cari menu"
        value={columnFilters[0].value as string}
        onChange={(e) =>
          setColumnFilters([
            {
              id: "name",
              value: e.target.value,
            },
          ])
        }
      />
      <Button
        className="w-[150px]"
        onClick={() => {
          setSelectedMealMenu(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Menu
      </Button>

      <Table className="w-2/3 table-fixed max-md:w-full">
        <TableCaption>Katalog Menu</TableCaption>
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
              className="cursor-pointer"
              onClick={() => {
                setSelectedMealMenu(row.original);
                setDialogOpen(true);
              }}
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

      <MealMenuForm
        initialData={selectedMealMenu}
        foods={foods}
        mealTypes={mealTypes}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          fetchMealMenus();
        }}
      />
    </div>
  );
};

export default MealMenuPage;
