import { Sidebar, MobileHeader } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <MobileHeader />
        {children}
      </div>
    </div>
  );
}
