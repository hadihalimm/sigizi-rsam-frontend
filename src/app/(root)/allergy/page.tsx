"use client";

import AllergyForm from "@/components/AllergyForm";
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

const AllergyPage = () => {
  const isMobile = useIsMobile();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "name",
      value: "",
    },
  ]);

  const fetchAllergies = async () => {
    try {
      const res = await api.get(`/allergy`);
      setAllergies(res.data.data as Allergy[]);
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, []);

  const columnHelper = createColumnHelper<Allergy>();
  const columns: ColumnDef<Allergy>[] = [
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
  ] as ColumnDef<Allergy>[];

  const table = useReactTable({
    columns,
    data: allergies,
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
          setSelectedAllergy(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Alergi
      </Button>

      <Table className="w-1/2 table-fixed max-md:w-full">
        <TableCaption>Daftar Alergi</TableCaption>
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
                setSelectedAllergy(row.original);
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
                {selectedAllergy ? "Edit Data Alergi" : "Tambah Jenis Alergi"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <AllergyForm
              initialData={selectedAllergy}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedAllergy(undefined);
                fetchAllergies();
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
                {selectedAllergy ? "Edit Data Alergi" : "Tambah Jenis Alergi"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <AllergyForm
              initialData={selectedAllergy}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedAllergy(undefined);
                fetchAllergies();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AllergyPage;
