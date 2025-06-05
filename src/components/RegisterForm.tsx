import React from "react";
import { z } from "zod";
import { UserRole } from "./UserForm";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

interface RegisterFormProps {
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username harus lebih dari 4 karakter" }),
  name: z.string().min(1, { message: "Silahkan masukkan nama user" }),
  password: z
    .string()
    .min(8, { message: "Password harus lebih dari 8 karakter" })
    .regex(/[A-Z]/, "Harus mengandung huruf kapital")
    .regex(/[a-z]/, "Harus mengandung huruf kecil")
    .regex(/[0-9]/, "Harus mengandung angka"),
  role: z.nativeEnum(UserRole),
});

const RegisterForm = ({ onSuccess, className }: RegisterFormProps) => {
  const form = useForm({
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        username: value.username,
        name: value.name,
        password: value.password,
        role: value.role,
      };
      console.log(value);
      try {
        const url = `/auth/register`;
        const method = "post";

        const res = await api[method](url, payload);
        console.log(res.status);
        onSuccess();
        toast.success(`Berhasil menambahkan user`);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
        console.error(err);
      }
    },
  });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <div className="grid grid-cols-4 grid-rows-4 items-center gap-x-2 gap-y-4">
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
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="col-span-3 row-start-3 max-h-[40px]">
          <form.Field name="password">
            {(field) => (
              <div>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="password"
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

        <div className="row-start-4">
          <Label htmlFor="name">Role</Label>
        </div>
        <div className="col-span-3 row-start-4 max-h-[40px]">
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
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" className="">
          <Save />
          Simpan
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
