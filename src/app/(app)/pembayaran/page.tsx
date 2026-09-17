import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/format";
import { SyncButton } from "./sync-button";
import { PembayaranFilterBar } from "./pembayaran-filter";
import { DeletePaymentButton } from "./delete-payment-button";
import { PaginationControls } from "@/components/pagination-controls";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function PembayaranPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; arah?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  let paymentQuery = supabase
    .from("payment_transactions")
    .select("*, matches:payment_matches(nominal_dialokasikan, invoice:invoice_id(nomor_invoice))", { count: "exact" })
    .neq("status", "ignored")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status) paymentQuery = paymentQuery.eq("status", params.status);
  if (params.arah) paymentQuery = paymentQuery.eq("arah", params.arah);
  if (params.dateFrom) paymentQuery = paymentQuery.gte("created_at", params.dateFrom + "T00:00:00");
  if (params.dateTo) paymentQuery = paymentQuery.lte("created_at", params.dateTo + "T23:59:59");

  const { data: payments, count: totalCount, error: queryError } = await paymentQuery;

  const filteredPayments = payments || [];

  const totalPages = Math.ceil((totalCount || 0) / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pembayaran</h1>
        <SyncButton />
      </div>
      <p className="text-muted-foreground">Transaksi pembayaran yang terdeteksi dari email bank.</p>

      <PembayaranFilterBar
        currentStatus={params.status || ""}
        currentArah={params.arah || ""}
        currentDateFrom={params.dateFrom || ""}
        currentDateTo={params.dateTo || ""}
      />

      {queryError && (
        <p className="text-sm text-destructive">{queryError.message}</p>
      )}

      {!queryError && (!filteredPayments || filteredPayments.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada transaksi pembayaran.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaksi akan terdeteksi otomatis dari notifikasi email bank.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((p: any) => {
            const matchInfo = p.matches?.[0];
            const invoiceNum = matchInfo?.invoice?.nomor_invoice;
            return (
              <div key={p.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.nama_pengirim || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.tanggal_transaksi ? new Date(p.tanggal_transaksi).toLocaleDateString("id-ID") : "-"} · {p.berita || "-"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatRupiah(p.nominal)}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "matched" ? "bg-green-100 text-green-700" :
                        p.status === "unmatched" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {p.status === "matched" ? "Tercocok" : p.status === "unmatched" ? "Belum cocok" : p.status}
                      </span>
                    </div>
                    <DeletePaymentButton id={p.id} />
                  </div>
                </div>
                {invoiceNum && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Invoice: <span className="font-medium text-foreground">{invoiceNum}</span> ({formatRupiah(matchInfo.nominal_dialokasikan)})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/pembayaran"
        params={{
          status: params.status,
          arah: params.arah,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }}
      />
    </div>
  );
}