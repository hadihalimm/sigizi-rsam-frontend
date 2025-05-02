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
import { usePathname } from "next/navigation";

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
        url: "/patient",
      },
    ],
  },
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
        url: "/food",
      },
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

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
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
