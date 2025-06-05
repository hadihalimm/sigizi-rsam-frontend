"use client";

import RegisterForm from "@/components/RegisterForm";
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
import UserForm from "@/components/UserForm";
import { useIsMobile } from "@/hooks/use-mobile";
import api from "@/lib/axios";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UsersPage = () => {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetchUsers = async () => {
    try {
      const res = await api.get(`/user`);
      setUsers(res.data.data as User[]);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columnHelper = createColumnHelper<User>();
  const columns: ColumnDef<User>[] = [
    columnHelper.accessor("id", {
      id: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("username", {
      id: "username",
      header: "Username",
      cell: (info) => info.getValue(),
      filterFn: "includesString",
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      filterFn: "includesString",
    }),
    columnHelper.accessor("role", {
      id: "role",
      header: "Role",
      cell: (info) =>
        info
          .getValue()
          .replace("_", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
    }),
    columnHelper.display({
      id: "combinedFilter",
      filterFn: (row, columnId, filterValue: string) => {
        const username = row.original.username.toLowerCase();
        const name = row.original.name.toLowerCase();
        const query = filterValue.toLowerCase();
        return username.includes(query) || name.includes(query);
      },
    }),
  ] as ColumnDef<User>[];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      columnVisibility: {
        id: false,
        combinedFilter: false,
      },
    },
  });
  return (
    <div className="mt-10 flex w-full flex-col gap-y-5 px-4">
      <Input
        type="text"
        className="w-1/2"
        placeholder="Cari user..."
        value={
          (table.getColumn("combinedFilter")?.getFilterValue() as string) ?? ""
        }
        onChange={(e) =>
          table.getColumn("combinedFilter")?.setFilterValue(e.target.value)
        }
      />
      <Button
        className="w-[150px]"
        onClick={() => {
          setSelectedUser(undefined);
          setDialogOpen(true);
        }}
      >
        Tambah User
      </Button>

      <Table className="w-1/2 table-fixed max-md:w-full">
        <TableCaption>Total: {users.length}</TableCaption>
        <TableHeader>
          <TableRow>
            {table.getFlatHeaders().map((header) => (
              <TableHead
                key={header.id}
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
              className="cursor-pointer"
              onClick={() => {
                setSelectedUser(row.original);
                setDialogOpen(true);
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="truncate"
                  suppressHydrationWarning
                >
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
                {selectedUser ? "Edit User" : "Tambah User"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            {selectedUser ? (
              <UserForm
                initialData={selectedUser}
                onSuccess={() => {
                  setDialogOpen(false);
                  setSelectedUser(undefined);
                  fetchUsers();
                }}
                className="px-4"
              />
            ) : (
              <RegisterForm
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchUsers();
                }}
              />
            )}
            <DrawerFooter className="pt-2"></DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Tambah User"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {selectedUser ? (
              <UserForm
                initialData={selectedUser}
                onSuccess={() => {
                  setDialogOpen(false);
                  setSelectedUser(undefined);
                  fetchUsers();
                }}
                className="px-4"
              />
            ) : (
              <RegisterForm
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchUsers();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UsersPage;
