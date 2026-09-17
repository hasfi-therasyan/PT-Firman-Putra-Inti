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
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            FPI-GMS
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistem manajemen distribusi gas LPG — PT Firman Putra Inti
          </p>
          <Link
            href="/masuk"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Masuk
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-3xl grid gap-8 sm:grid-cols-2">
          {[
            { title: "Distribusi", desc: "Jadwalkan dan lacak pengiriman tabung ke setiap pangkalan." },
            { title: "Invoice", desc: "Buat dan kelola tagihan otomatis dari jadwal pengiriman." },
            { title: "Pembayaran", desc: "Deteksi otomatis dari notifikasi email bank." },
            { title: "Rekonsiliasi", desc: "Cocokkan pembayaran dengan tagihan secara akurat." },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PT Firman Putra Inti
      </footer>
    </div>
  );
}
