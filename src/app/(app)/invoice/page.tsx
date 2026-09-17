import type { Metadata } from "next";
import Link from "next/link";
import { getInvoiceList } from "./actions";
import { formatRupiah } from "@/lib/utils/format";
import { InvoiceFilterBar } from "./invoice-filter";
import { PaginationControls } from "@/components/pagination-controls";

export const metadata: Metadata = {
  title: "Invoice",
};

interface InvoiceRow {
  id: string;
  nomor_invoice: string;
  total: number;
  total_dibayar: number;
  status: string;
  tanggal_invoice: string;
  pangkalan?: { nama: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", issued: "Diterbitkan", partial: "Sebagian",
  paid: "Lunas", overdue: "Jatuh Tempo", cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", issued: "bg-info/10 text-info",
  partial: "bg-warning/10 text-warning", paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive", cancelled: "bg-muted text-muted-foreground",
};

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  let invoices: InvoiceRow[] = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const result = await getInvoiceList({
      status: params.status || undefined,
      search: params.search || undefined,
      page,
      limit,
    });
    invoices = result.data || [];
    totalCount = result.count || 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data";
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <Link href="/invoice/new" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          + Baru
        </Link>
      </div>

      <InvoiceFilterBar
        currentStatus={params.status || ""}
        currentSearch={params.search || ""}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && invoices.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada invoice.</p>
        </div>
      )}
      <div className="space-y-2">
        {invoices.map((inv) => {
          const paid = inv.total_dibayar || 0;
          const progressPct = inv.total > 0 ? Math.min(100, (paid / inv.total) * 100) : 0;
          return (
            <Link key={inv.id} href={`/invoice/${inv.id}`} className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{inv.nomor_invoice}</p>
                  <p className="text-xs text-muted-foreground">{inv.pangkalan?.nama || "Unknown"} · {inv.tanggal_invoice}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status || "draft"]}`}>
                    {STATUS_LABELS[inv.status || "draft"]}
                  </span>
                  <p className="mt-1 text-sm font-semibold tabular-nums">{formatRupiah(inv.total)}</p>
                </div>
              </div>
              {paid > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex-1 rounded-full bg-muted h-1.5">
                    <div className="h-full rounded-full bg-success" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-muted-foreground tabular-nums">{formatRupiah(paid)} / {formatRupiah(inv.total)}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/invoice"
        params={{ status: params.status, search: params.search }}
      />
    </div>
  );
}