import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <Sidebar />
      <main className="ml-[200px] p-8">{children}</main>
    </div>
  );
}
