"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ChevronUp } from "lucide-react";
import useSessionStore from "@/hooks/use-session";
import axios from "axios";
import toast from "react-hot-toast";

const sidebarData = [
  {
    title: "Aplikasi",
    url: "#",
    items: [
      {
        title: "Permintaan Makanan",
        url: "/",
      },
      {
        title: "Daftar Pasien",
        url: "/patients",
      },
    ],
  },
];

const sidebarAdmin = [
  {
    title: "Admin",
    url: "#",
    items: [
      {
        title: "Katalog Menu",
        url: "/menu",
      },
      {
        title: "Katalog Bahan Makanan",
        url: "/foods",
      },
      {
        title: "Daftar User",
        url: "/users",
      },
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearSession } = useSessionStore();

  const handleLogout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await axios.post(`${baseUrl}/auth/logout`, null, {
        withCredentials: true,
      });
      console.log(res.status);
      clearSession();
      toast.success(res.data.message);
      router.push("/sign-in");
    } catch (err) {
      console.error("Error checking session: ", err);
      clearSession();
      router.push("/sign-in");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarMenuItem>
              <p className="text-center text-2xl font-bold">SIGIZI RSAM</p>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {sidebarAdmin.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="mb-4">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {user?.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[230px]">
                <Link href="/user">
                  <DropdownMenuItem>
                    <span>User Detail</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
