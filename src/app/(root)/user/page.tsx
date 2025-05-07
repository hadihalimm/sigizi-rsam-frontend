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
import { Save } from "lucide-react";
import React, { useState } from "react";

const UserPage = () => {
  const [openPasswordForm, setOpenPassworForm] = useState(false);
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
            <p className="col-span-3">hadihalim</p>
            <p className="row-start-2">Nama</p>
            <Input className="col-span-2 row-start-2 w-[175px]" />
            <Button size="icon">
              <Save />
            </Button>
            <p className="row-start-3">Role</p>
            <p className="col-span-3 row-start-3">Admin</p>
            <Button
              variant="outline"
              className="col-span-2 row-start-4"
              onClick={() => {
                setOpenPassworForm(true);
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
          onOpenChange={setOpenPassworForm}
        />
      )}
    </div>
  );
};

export default UserPage;
