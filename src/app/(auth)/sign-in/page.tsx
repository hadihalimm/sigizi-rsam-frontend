"use client";

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
import axios, { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Please enter your username" }),
  password: z.string().min(1, { message: "Please enter your password" }),
});

const SignInPage = () => {
  const router = useRouter();
  const { user, setSession } = useSessionStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sign-in`,
          {
            username: value.username,
            password: value.password,
          },
          {
            withCredentials: true,
          },
        );
        setSession(res.data.data as UserSession);
        console.log(user);
        toast.success("Berhasil Sign in");
        router.push("/");
      } catch (err) {
        if (isAxiosError(err)) {
          console.log(err.response?.data.error);
          toast.error(String(err.response?.data.error));
        } else {
          toast.error(String(err));
        }
      }
    },
  });

  return (
    <section className="relative flex h-screen flex-col items-center justify-center gap-y-8">
      <Image
        src={"/signin-blob.svg"}
        alt="blob"
        width={900}
        height={900}
        className="absolute z-0 mt-[40px]"
        priority
      />
      <Card className="z-10 w-[350px]">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="rounded-md text-2xl">
              Sign in to SIGIZI
            </CardTitle>
            <CardDescription>RSAM Bukittinggi</CardDescription>
          </div>
          <Image
            src={"/rsam-logo.jpg"}
            alt="Logo RSAM"
            width={40}
            height={40}
          />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col items-center gap-y-2">
              <form.Field
                name="username"
                children={(field) => (
                  <>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 &&
                      field.state.meta.errors.map((err, idx) => (
                        <p key={idx} className="space-y-1 text-sm text-red-500">
                          {err?.message}
                        </p>
                      ))}
                  </>
                )}
              />

              <form.Field
                name="password"
                children={(field) => (
                  <div className="relative flex w-full items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-2"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff color="grey" />
                      ) : (
                        <Eye color="grey" />
                      )}
                    </button>
                    {field.state.meta.errors.length > 0 &&
                      field.state.meta.errors.map((err, idx) => (
                        <p key={idx} className="text-sm text-red-500">
                          {err?.message}
                        </p>
                      ))}
                  </div>
                )}
              />
              <Button type="submit" className="mt-8 w-1/2">
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default SignInPage;
