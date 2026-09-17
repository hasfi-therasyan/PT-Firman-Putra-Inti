import type { Metadata } from "next";
import Link from "next/link";
import { getJadwalList } from "./actions";
import { JadwalFilterBar } from "./jadwal-filter";
import { PaginationControls } from "@/components/pagination-controls";

export const metadata: Metadata = {
  title: "Jadwal",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  dijadwalkan: "Dijadwalkan",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  dijadwalkan: "bg-blue-100 text-blue-700",
  dikirim: "bg-yellow-100 text-yellow-700",
  selesai: "bg-green-100 text-green-700",
  dibatalkan: "bg-red-100 text-red-700",
};

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  let jadwal: Array<any> = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const result = await getJadwalList({
      status: params.status || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      page,
      limit,
    });
    jadwal = result.data || [];
    totalCount = result.count || 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data";
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jadwal Pengiriman</h1>
        <Link
          href="/jadwal/new"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + Baru
        </Link>
      </div>

      <JadwalFilterBar
        currentStatus={params.status || ""}
        currentDateFrom={params.dateFrom || ""}
        currentDateTo={params.dateTo || ""}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && jadwal.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada jadwal pengiriman.</p>
          <Link
            href="/jadwal/new"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Buat jadwal pertama
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {jadwal.map((j) => (
          <Link key={j.id} href={`/jadwal/${j.id}`} className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {(j.pangkalan as any)?.nama || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {j.tanggal_rencana} · {j.jumlah_tabung} tabung
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[j.status || "draft"]
                }`}
              >
                {STATUS_LABELS[j.status || "draft"]}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/jadwal"
        params={{ status: params.status, dateFrom: params.dateFrom, dateTo: params.dateTo }}
      />
    </div>
  );
}