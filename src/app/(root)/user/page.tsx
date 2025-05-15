"use client";

import ChangePasswordForm from "@/components/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useSessionStore from "@/hooks/use-session";
import { useForm } from "@tanstack/react-form";
import axios from "axios";
import { Save } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const UserPage = () => {
  const [openPasswordForm, setOpenPasswordForm] = useState(false);
  const { user } = useSessionStore();
  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const payload = {
        name: value.name,
      };
      try {
        const url = `${baseUrl}/user/${user?.userID}/actions/change-name`;
        const res = await axios.post(url, payload);
        toast.success(`[${res.status}] Berhasil mengganti nama`);
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    },
  });
  return (
    <div className="my-10 mt-10 flex w-full flex-col gap-y-5 px-4">
      <Card className="w-[375px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Detail</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 items-center gap-x-12 gap-y-4">
            <p>Username</p>
            <p className="col-span-3">{user?.username}</p>
            <p className="row-start-2">Nama</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="col-span-3 row-start-2"
            >
              <form.Field
                name="name"
                validators={{
                  onChange: z.string().min(1, "Silahkan masukkan nama"),
                }}
              >
                {(field) => (
                  <div className="flex gap-x-2">
                    <Input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-[180px]"
                    />
                    {!field.state.meta.isValid && (
                      <p className="text-[10px] text-red-500">
                        {field.state.meta.errors
                          .map((err) => err?.message)
                          .join(", ")}
                      </p>
                    )}
                    <Button size="icon" type="submit">
                      <Save />
                    </Button>
                  </div>
                )}
              </form.Field>
            </form>
            <p className="row-start-3">Role</p>
            <p className="col-span-3 row-start-3">{user?.role}</p>
            <Button
              variant="outline"
              className="col-span-2 row-start-4"
              onClick={() => {
                setOpenPasswordForm(true);
              }}
            >
              Ganti password
            </Button>
          </div>
        </CardContent>
      </Card>
      {openPasswordForm && (
        <ChangePasswordForm
          open={openPasswordForm}
          onOpenChange={setOpenPasswordForm}
        />
      )}
    </div>
  );
};

export default UserPage;
