import type { Metadata } from "next";
import Link from "next/link";
import { getPangkalanList } from "./actions";
import { PaginationControls } from "@/components/pagination-controls";

export const metadata: Metadata = {
  title: "Pangkalan",
};

interface PangkalanRow {
  id: string;
  nama: string;
  kode: string;
  kecamatan?: string | null;
  kota?: string | null;
  status: string;
}

export default async function PangkalanPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  let pangkalan: PangkalanRow[] = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const result = await getPangkalanList({
      search: params.search || undefined,
      status: params.status || undefined,
      page,
      limit,
    });
    pangkalan = result.data || [];
    totalCount = result.count || 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data";
  }

  const totalPages = Math.ceil(totalCount / limit);

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
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p.status === "aktif" ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/pangkalan"
        params={{ search: params.search, status: params.status }}
      />
    </div>
  );
}