/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import PatientForm from "@/components/PatientForm";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { generatePagination } from "@/lib/utils";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import React, { useEffect, useState } from "react";

const PatientPage = () => {
  const isMobile = useIsMobile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatient, setTotalPatient] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 1000);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/patient/paginated`,
        {
          params: {
            page: currentPage,
            limit,
            keyword: debouncedKeyword,
          },
        },
      );
      setPatients(res.data.data as Patient[]);
      setTotalPatient(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, limit, debouncedKeyword]);

  const columnHelper = createColumnHelper<Patient>();
  const columns: ColumnDef<Patient>[] = [
    columnHelper.accessor("id", {
      id: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("medicalRecordNumber", {
      id: "medicalRecordNumber",
      header: "Nomor MR",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("dateOfBirth", {
      id: "dateOfBirth",
      header: "Tanggal Lahir",
      cell: (info) => {
        const rawDate = info.getValue();
        return rawDate ? format(new Date(rawDate), "PPP", { locale: id }) : "-";
      },
    }),
  ] as ColumnDef<Patient>[];

  const table = useReactTable({
    columns,
    data: patients,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    initialState: {
      columnVisibility: {
        id: false,
      },
    },
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <Input
        type="text"
        placeholder="Cari pasien"
        value={keyword}
        onChange={(e) => {
          setCurrentPage(1);
          setKeyword(e.target.value);
        }}
      />
      <Button
        className="w-[150px]"
        onClick={() => {
          setSelectedPatient(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah Pasien
      </Button>

      <Table>
        <TableCaption>Total: {totalPatient}</TableCaption>
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
                setSelectedPatient(row.original);
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

      <Pagination>
        <PaginationContent>
          <PaginationItem className="cursor-pointer select-none">
            <PaginationPrevious
              onClick={() => {
                setCurrentPage((oldPage) => Math.max(oldPage - 1, 1));
              }}
            />
          </PaginationItem>

          {generatePagination(totalPages, currentPage - 1).map(
            (pageItem, index) => (
              <PaginationItem
                key={index}
                className="cursor-pointer select-none"
              >
                {typeof pageItem === "number" ? (
                  <PaginationLink
                    onClick={() => {
                      setCurrentPage(Number(pageItem) + 1);
                    }}
                    isActive={pageItem + 1 === currentPage}
                  >
                    {pageItem + 1}
                  </PaginationLink>
                ) : (
                  <span className="cursor-default select-none">{pageItem}</span>
                )}
              </PaginationItem>
            ),
          )}

          <PaginationItem className="cursor-pointer select-none">
            <PaginationNext
              onClick={() => {
                setCurrentPage((oldPage) => Math.min(oldPage + 1, totalPages));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {selectedPatient ? "Edit Data Pasien" : "Tambah Data Pasien"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <PatientForm
              initialData={selectedPatient}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedPatient(undefined);
                fetchPatients();
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
                {selectedPatient ? "Edit Data Pasien" : "Tambah Data Pasien"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <PatientForm
              initialData={selectedPatient}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedPatient(undefined);
                fetchPatients();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientPage;
