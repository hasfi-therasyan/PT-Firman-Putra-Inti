import type { Metadata } from "next";
import Link from "next/link";
import { getPangkalanList } from "./actions";

export const metadata: Metadata = {
  title: "Pangkalan",
};

export default async function PangkalanPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  let pangkalan: Awaited<ReturnType<typeof getPangkalanList>> = [];
  let error: string | null = null;

  try {
    pangkalan = await getPangkalanList(params.search, params.status);
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pangkalan</h1>
        <Link
          href="/pangkalan/new"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + Baru
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Cari nama atau kode..."
          className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Cari
        </button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && pangkalan.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada pangkalan terdaftar.</p>
          <Link
            href="/pangkalan/new"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Tambah pangkalan pertama
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {pangkalan.map((p) => (
          <Link
            key={p.id}
            href={`/pangkalan/${p.id}`}
            className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{p.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {p.kode} · {p.kecamatan || p.kota || ""}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.status === "aktif"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {p.status === "aktif" ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              {p.pic_nama && <span>PIC: {p.pic_nama}</span>}
            </div>
            {(p.tabung_3kg > 0 || p.tabung_5kg > 0 || p.tabung_12kg > 0) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {p.tabung_3kg > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">3kg: {p.tabung_3kg}</span>}
                {p.tabung_5kg > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">5kg: {p.tabung_5kg}</span>}
                {p.tabung_12kg > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 font-medium text-purple-700">12kg: {p.tabung_12kg}</span>}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
