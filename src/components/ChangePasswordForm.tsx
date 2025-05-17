"use client";

import { useForm } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import toast from "react-hot-toast";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import useSessionStore from "@/hooks/use-session";
import api from "@/lib/axios";

interface ChangePasswordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password harus lebih dari 8 karakter" })
      .regex(/[A-Z]/, "Harus mengandung huruf kapital")
      .regex(/[a-z]/, "Harus mengandung huruf kecil")
      .regex(/[0-9]/, "Harus mengandung angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

const ChangePasswordForm = ({
  open,
  onOpenChange,
}: ChangePasswordFormProps) => {
  const { user } = useSessionStore();
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const payload = {
        password: value.password,
      };
      try {
        const url = `/user/${user?.userID}/actions/change-password`;
        const res = await api.post(url, payload);
        console.log(res.status);
        toast.success(`[${res.status}] Berhasil mengganti password`);
        onOpenChange(false);
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    },
  });

  const formContent = (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className=""
    >
      <div className="grid grid-cols-4 grid-rows-2 items-center gap-x-2 gap-y-4 px-4">
        <div>
          <Label htmlFor="username">New password</Label>
        </div>
        <div className="col-span-3 max-h-[70px]">
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

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="confirmPassword">
            {(field) => (
              <div>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="confirmPassword"
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
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" className="">
          Submit
        </Button>
      </div>
    </form>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Ganti password</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {formContent}
        <DrawerFooter className="pt-2"></DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti password</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordForm;
