import { BottomNav, Sidebar } from "@/components/navigation";
import { AutoSync } from "@/components/auto-sync";
import Link from "next/link";

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
        {/* Top bar — mobile & desktop */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          <span className="font-bold lg:hidden">FPI-GMS</span>
          <div className="hidden lg:block font-bold">FPI-GMS</div>
          <div className="flex items-center gap-2">
            <Link
              href="/rekonsiliasi"
              className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1"
            >
              Rekon
            </Link>
            <Link
              href="/pengaturan"
              className="inline-flex items-center justify-center size-9 rounded-full bg-muted text-foreground hover:bg-muted/80"
              title="Pengaturan & Profil"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
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
