"use client";

import FoodForm from "@/components/FoodForm";
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

const FoodPage = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodMaterials, setFoodMaterials] = useState<FoodMaterial[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

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

  const fetchFoodMaterials = async () => {
    try {
      const res = await api.get("/food-material");
      setFoodMaterials(res.data.data as FoodMaterial[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchFoodMaterials();
  }, []);

  const columnHelper = createColumnHelper<Food>();
  const columns: ColumnDef<Food>[] = [
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
    columnHelper.accessor("foodMaterialUsages", {
      id: "foodMaterialUsages",
      header: "Bahan makanan",
      cell: (info) => (
        <ul className="list-disc gap-y-1">
          {info.getValue().map((usage, index) => (
            <li key={index}>
              {usage.quantityUsed} {usage.foodMaterial.unit}{" "}
              {usage.foodMaterial.name}
            </li>
          ))}
        </ul>
      ),
    }),
  ] as ColumnDef<Food>[];

  const table = useReactTable({
    columns,
    data: foods,
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
        placeholder="Cari makanan"
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
          setSelectedFood(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Makanan
      </Button>

      <Table className="w-1/2 table-fixed max-md:w-full">
        <TableCaption>Katalog Bahan Makanan</TableCaption>
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
                setSelectedFood(row.original);
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

      <FoodForm
        initialData={selectedFood}
        foodMaterials={foodMaterials}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          setSelectedFood(undefined);
          fetchFoods();
        }}
      />
    </div>
  );
};

export default FoodPage;
