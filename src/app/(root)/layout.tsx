import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <div className="bg-background relative right-[1px] z-10 my-2 mr-2 w-fit rounded-r-md border-y border-r p-2">
          <SidebarTrigger className="text-secondary bg-primary" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
