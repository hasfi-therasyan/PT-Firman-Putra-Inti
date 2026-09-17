import { BottomNav, Sidebar } from "@/components/navigation";
import { AutoSync } from "@/components/auto-sync";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <AutoSync />
      <div className="flex flex-1 flex-col lg:ml-0">
        {/* Top bar — desktop only */}
        <header className="hidden h-14 items-center border-b px-6 lg:flex">
          <span className="font-bold">FPI-GMS</span>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:py-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
