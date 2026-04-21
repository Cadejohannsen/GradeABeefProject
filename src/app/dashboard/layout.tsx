import { TopNav } from "@/components/layout/topnav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {/* Push content below fixed topnav (--topnav-h = 58px) */}
      <main
        className="mx-auto px-8 py-8"
        style={{ paddingTop: "calc(var(--topnav-h) + 2rem)", maxWidth: "1400px" }}
      >
        {children}
      </main>
    </div>
  );
}
