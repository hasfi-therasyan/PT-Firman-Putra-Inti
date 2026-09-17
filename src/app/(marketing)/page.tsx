import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FPI-GMS — Sistem Manajemen Distribusi Gas",
  description:
    "Kelola distribusi, invoice, dan pembayaran gas LPG dalam satu sistem terpadu.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-white"
        style={{
          background:
            "radial-gradient(1200px 500px at 50% -10%, rgba(248,145,37,0.28), transparent 60%), linear-gradient(160deg, #2f5c96 0%, #134376 52%, #0b1119 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(520px 320px at 50% 30%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(520px 320px at 50% 30%, black, transparent 75%)",
          }}
        />
        <div className="relative max-w-md space-y-6">
          <span
            aria-hidden="true"
            className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-[22px] shadow-2xl ring-1 ring-white/30"
            style={{
              background: "linear-gradient(135deg, #2f5c96 0%, #134376 55%, #0b1119 100%)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
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
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/90">
              PT Firman Putra Inti
            </p>
            <h1 className="text-3xl font-bold tracking-[0.12em] sm:text-4xl">
              FPI-GMS
            </h1>
          </div>
          <p className="text-base text-white/80">
            Sistem manajemen distribusi gas LPG — kelola pangkalan, jadwal,
            invoice, dan pembayaran dalam satu sistem terpadu.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/masuk"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-8 text-sm font-bold text-[#231303] shadow-lg shadow-black/25 transition-colors hover:bg-amber-400"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Lihat Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
            <span>Distribusi</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-amber-400/80" />
            <span>Invoice</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-amber-400/80" />
            <span>Rekonsiliasi</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Alur distribusi gas, ujung ke ujung
          </p>
          <h2 className="mt-2 text-center text-xl font-bold tracking-tight">
            Dari tabung keluar hingga uang masuk
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Distribusi", desc: "Jadwalkan dan lacak pengiriman tabung ke setiap pangkalan." },
              { title: "Invoice", desc: "Buat dan kelola tagihan otomatis dari jadwal pengiriman." },
              { title: "Pembayaran", desc: "Deteksi otomatis dari notifikasi email bank." },
              { title: "Rekonsiliasi", desc: "Cocokkan pembayaran dengan tagihan secara akurat." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PT Firman Putra Inti
      </footer>
    </div>
  );
}
