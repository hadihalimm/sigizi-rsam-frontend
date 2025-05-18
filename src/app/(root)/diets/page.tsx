"use client";

import DietForm from "@/components/DietForm";
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
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DietsPage = () => {
  const isMobile = useIsMobile();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<Diet>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

  const fetchDiets = async () => {
    try {
      const res = await api.get(`/diet`);
      setDiets(res.data.data as Diet[]);
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  useEffect(() => {
    fetchDiets();
  }, []);

  const columnHelper = createColumnHelper<Diet>();
  const columns: ColumnDef<Diet>[] = [
    columnHelper.accessor("id", {
      id: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("code", {
      id: "code",
      header: "Kode",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
    }),
  ] as ColumnDef<Diet>[];

  const table = useReactTable({
    columns,
    data: diets,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: {
        id: false,
      },
    },
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="mt-10 mb-16 flex w-full flex-col gap-y-5 px-4">
      <Button
        className="w-[150px]"
        onClick={() => {
          setSelectedDiet(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Jenis Diet
      </Button>

      <Table className="w-1/2 table-fixed max-md:w-full">
        <TableCaption>Jenis Diet</TableCaption>
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
                setSelectedDiet(row.original);
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
                {selectedDiet ? "Edit Data Diet" : "Tambah Jenis Diet"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DietForm
              initialData={selectedDiet}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDiet(undefined);
                fetchDiets();
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
                {selectedDiet ? "Edit Data Makanan" : "Tambah Data Makanan"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <DietForm
              initialData={selectedDiet}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedDiet(undefined);
                fetchDiets();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DietsPage;
