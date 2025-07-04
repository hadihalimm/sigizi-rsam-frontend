/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect } from "react";
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
  useSidebar,
} from "./sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import useSessionStore from "@/hooks/use-session";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import Image from "next/image";
import { ChevronUp } from "lucide-react";

const sidebarData = [
  {
    title: "Aplikasi",
    url: "#",
    items: [
      {
        title: "Permintaan Makanan",
        url: "/",
        icon: "/meal.png",
      },
      {
        title: "Daftar Pasien",
        url: "/patients",
        icon: "/patient.png",
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
        url: "/meal-menu",
        icon: "/breakfast.png",
      },
      {
        title: "Katalog Makanan",
        url: "/food",
        icon: "/burger.png",
      },
      {
        title: "Katalog Bahan Makanan",
        url: "/food-material",
        icon: "/vegetable.png",
      },
      {
        title: "Daftar Diet",
        url: "/diet",
        icon: "/diet.png",
      },
      {
        title: "Daftar Alergi",
        url: "/allergy",
        icon: "/allergy.png",
      },
      {
        title: "Daftar User",
        url: "/users",
        icon: "/users.png",
      },
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setSession, clearSession } = useSessionStore();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/auth/check-session`);
        setSession(res.data.data as UserSession);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(err.response?.data);
          console.error(err);
        } else {
          console.error(err);
        }
      }
    };
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await api.post(`/auth/logout`, null, {
        withCredentials: true,
      });
      clearSession();
      localStorage.removeItem("meal-filter-storage");
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
            <SidebarMenuItem className="flex items-center justify-center">
              <p className="text-foreground bg-primary font-merriweather w-fit rounded-md p-2 text-2xl font-extrabold">
                SIGIZI RSAM
              </p>
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
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Link href={item.url}>
                          <Image
                            src={item.icon}
                            alt={item.title}
                            width={20}
                            height={20}
                          />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {user?.role === "admin" &&
          sidebarAdmin.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => setOpenMobile(false)}
                        >
                          <Link href={item.url}>
                            <Image
                              src={item.icon}
                              alt={item.title}
                              width={20}
                              height={20}
                            />
                            {item.title}
                          </Link>
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
                  {user?.name}
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
