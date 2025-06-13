import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import toast from "react-hot-toast";
import ResetPasswordDialog from "./ResetPasswordDialog";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

interface UserFormProps {
  initialData?: User;
  onSuccess: () => void;
  className?: string;
}

export enum UserRole {
  Perawat = "perawat",
  AhliGizi = "ahli_gizi",
  Admin = "admin",
}

const formSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username harus lebih dari 4 karakter" }),
  name: z.string().min(1, { message: "Silahkan masukkan nama user" }),
  role: z.nativeEnum(UserRole),
});

const UserForm = ({ initialData, onSuccess, className }: UserFormProps) => {
  const form = useForm({
    defaultValues: {
      username: initialData?.username ?? "",
      name: initialData?.name ?? "",
      role: initialData?.role ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        username: value.username,
        name: value.name,
        role: value.role,
      };
      console.log(value);
      try {
        const url = `/admin/user/${initialData?.id}`;
        const method = "patch";

        const res = await api[method](url, payload);
        console.log(res.status);
        onSuccess();
        toast.success(`Berhasil mengubah data`);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
        console.error(err);
      }
    },
  });

  const onDelete = async (id: number) => {
    try {
      const res = await api.delete(`/admin/user/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus user");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <div className="grid grid-cols-4 grid-rows-4 items-center gap-4 gap-x-2">
        <div>
          <Label htmlFor="username">Username</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="username">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="username"
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.errors.map((err, idx) => (
                    <p key={idx} className="text-[10px] text-red-500">
                      {err?.message}
                    </p>
                  ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="row-start-2">
          <Label htmlFor="name">Nama</Label>
        </div>
        <div className="col-span-3 row-start-2 max-h-[40px]">
          <form.Field name="name">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="name"
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.errors.map((err, idx) => (
                    <p key={idx} className="text-[10px] text-red-500">
                      {err?.message}
                    </p>
                  ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="row-start-3">
          <Label htmlFor="name">Role</Label>
        </div>
        <div className="col-span-3 row-start-3 max-h-[40px]">
          <form.Field name="role">
            {(field) => (
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </div>

        <div className="row-start-4">
          <ResetPasswordDialog
            user={initialData!}
            onConfirm={() => onSuccess()}
          />
        </div>
      </div>
      {initialData && (
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            className=""
            variant="destructive"
            onClick={() => onDelete(initialData.id)}
          >
            <Trash />
            Hapus
          </Button>
          <Button type="submit" className="">
            <Save />
            Simpan
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserForm;
