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
          <span className="flex items-center gap-2 lg:hidden">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center overflow-hidden rounded-lg shadow-sm"
              style={{
                background: "linear-gradient(135deg, #2f5c96 0%, #134376 55%, #0b1119 100%)",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 64 64" fill="none">
                <rect x="30" y="6" width="4" height="8" rx="1" fill="#f6fbff" />
                <rect x="19" y="13" width="26" height="38" rx="6" fill="#f6fbff" />
                <rect x="17" y="47" width="30" height="6" rx="3" fill="#cfdfef" />
                <path
                  d="M32 18c5.5 7.5 9 11.8 9 16.4A9 9 0 0 1 23 34.4C23 29.8 26.5 25.5 32 18Z"
                  fill="#f89125"
                />
                <path
                  d="M32 26.5c2.6 3.6 4.2 5.6 4.2 8A4.2 4.2 0 0 1 27.8 34.5c0-2.4 1.6-4.4 4.2-8Z"
                  fill="#fffaf0"
                />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-[0.12em]">FPI-GMS</span>
          </span>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">Gas Management System</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              PT Firman Putra Inti
            </span>
          </div>
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
