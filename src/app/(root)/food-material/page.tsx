"use client";

import FoodForm from "@/components/FoodForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { useIsMobile } from "@/hooks/use-mobile";
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

const FoodMaterialPage = () => {
  const isMobile = useIsMobile();
  const [foods, setFoods] = useState<Food[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | undefined>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

  const fetchFoods = async () => {
    try {
      const res = await api.get(`/food`);
      setFoods(res.data.data as Food[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
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
    columnHelper.accessor("unit", {
      id: "unit",
      header: "Satuan",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("price_per_unit", {
      id: "price_per_unit",
      header: "Harga per Unit",
      cell: (info) => {
        const value = info.getValue();
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(value as number);
      },
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Updated at",
      cell: (info) => info.getValue(),
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
        <TableCaption>Katalog Makanan</TableCaption>
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

      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {selectedFood ? "Edit Data Makanan" : "Tambah Data Makanan"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <FoodForm
              initialData={selectedFood}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedFood(undefined);
                fetchFoods();
              }}
              className="px-4"
            />
            <DrawerFooter className="pt-2"></DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                {selectedFood ? "Edit Data Makanan" : "Tambah Data Makanan"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <FoodForm
              initialData={selectedFood}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedFood(undefined);
                fetchFoods();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FoodMaterialPage;
