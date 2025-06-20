"use client";

import FoodMaterialForm from "@/components/FoodMaterialForm";
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
  const [foodMaterials, setFoodMaterials] = useState<FoodMaterial[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFoodMaterial, setSelectedFoodMaterial] = useState<
    FoodMaterial | undefined
  >();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

  const fetchFoods = async () => {
    try {
      const res = await api.get(`/food-material`);
      setFoodMaterials(res.data.data as FoodMaterial[]);
      console.log(res.data.data);
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

  const columnHelper = createColumnHelper<FoodMaterial>();
  const columns: ColumnDef<FoodMaterial>[] = [
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
    columnHelper.accessor("standardPerMeal", {
      id: "standardPerMeal",
      header: "Standar per pasien",
      cell: (info) => info.getValue(),
    }),
  ] as ColumnDef<FoodMaterial>[];

  const table = useReactTable({
    columns,
    data: foodMaterials,
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
        placeholder="Cari bahan makanan"
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
        className="w-[200px]"
        onClick={() => {
          setSelectedFoodMaterial(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Bahan Makanan
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
                setSelectedFoodMaterial(row.original);
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
                {selectedFoodMaterial
                  ? "Edit Bahan Makanan"
                  : "Tambah Bahan Makanan"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <FoodMaterialForm
              initialData={selectedFoodMaterial}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedFoodMaterial(undefined);
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
                {selectedFoodMaterial
                  ? "Edit Bahan Makanan"
                  : "Tambah Bahan Makanan"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <FoodMaterialForm
              initialData={selectedFoodMaterial}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedFoodMaterial(undefined);
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
