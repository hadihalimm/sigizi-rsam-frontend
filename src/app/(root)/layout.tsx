import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger className="text-secondary bg-primary mx-4 my-2" />
        {children}
      </main>
    </SidebarProvider>
  );
}
