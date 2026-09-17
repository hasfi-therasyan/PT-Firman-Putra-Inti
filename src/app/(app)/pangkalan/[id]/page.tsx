import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("pangkalan").select("nama").eq("id", id).single();
  return { title: data?.nama || "Pangkalan" };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  dijadwalkan: { label: "Dijadwalkan", cls: "bg-info/10 text-info" },
  dikirim: { label: "Dikirim", cls: "bg-warning/10 text-warning" },
  selesai: { label: "Selesai", cls: "bg-success/10 text-success" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-muted text-muted-foreground" },
  issued: { label: "Diterbitkan", cls: "bg-info/10 text-info" },
  partial: { label: "Sebagian", cls: "bg-warning/10 text-warning" },
  paid: { label: "Lunas", cls: "bg-success/10 text-success" },
  overdue: { label: "Jatuh Tempo", cls: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Dibatalkan", cls: "bg-muted text-muted-foreground" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export default async function PangkalanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pangkalan } = await supabase.from("pangkalan").select("*").eq("id", id).single();
  if (!pangkalan) notFound();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, items:invoice_items(deskripsi, qty, unit_price, line_total)")
    .eq("pangkalan_id", id)
    .order("created_at", { ascending: false });

  const { data: schedules } = await supabase
    .from("delivery_schedules")
    .select("*")
    .eq("pangkalan_id", id)
    .order("tanggal_rencana", { ascending: false });

  const totalDitagih = (invoices ?? []).reduce((s: number, i: any) => s + i.total, 0);
  const totalDibayar = (invoices ?? []).reduce((s: number, i: any) => s + (i.total_dibayar || 0), 0);
  const sisa = totalDitagih - totalDibayar;

  // Computed tabung sum for consistency display
  const tabungComputed = (pangkalan.tabung_3kg || 0) + (pangkalan.tabung_5kg || 0) + (pangkalan.tabung_12kg || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/pangkalan" className="text-xs text-muted-foreground hover:underline">&larr; Kembali</Link>
          <h1 className="mt-1 text-2xl font-bold">{pangkalan.nama}</h1>
          <p className="text-sm text-muted-foreground">{pangkalan.kode} &middot; {pangkalan.kota || pangkalan.kecamatan || ""}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pangkalan.status === "aktif" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {pangkalan.status === "aktif" ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Ditagih</p>
          <p className="text-lg font-bold tabular-nums">{formatRupiah(totalDitagih)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Dibayar</p>
          <p className="text-lg font-bold tabular-nums text-success">{formatRupiah(totalDibayar)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Sisa</p>
          <p className={`text-lg font-bold tabular-nums ${sisa > 0 ? "text-destructive" : ""}`}>{formatRupiah(sisa)}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
        {pangkalan.pic_nama && <div className="flex justify-between"><span className="text-muted-foreground">PIC</span><span className="font-medium">{pangkalan.pic_nama}</span></div>}
        {pangkalan.telepon && <div className="flex justify-between"><span className="text-muted-foreground">Telepon</span><span className="font-medium">{pangkalan.telepon}</span></div>}
        {pangkalan.alamat && <div className="flex justify-between"><span className="text-muted-foreground">Alamat</span><span className="font-medium">{pangkalan.alamat}</span></div>}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tabung</span>
          <span className="font-medium">{tabungComputed}</span>
        </div>
      </div>

      {(pangkalan.tabung_3kg > 0 || pangkalan.tabung_5kg > 0 || pangkalan.tabung_12kg > 0) && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">Jumlah Tabung LPG</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-info/10 p-3">
              <p className="text-2xl font-bold text-info">{pangkalan.tabung_3kg || 0}</p>
              <p className="text-xs text-info">3kg</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-3">
              <p className="text-2xl font-bold text-warning">{pangkalan.tabung_5kg || 0}</p>
              <p className="text-xs text-warning">5kg</p>
            </div>
            <div className="rounded-lg bg-vapor/10 p-3">
              <p className="text-2xl font-bold text-vapor">{pangkalan.tabung_12kg || 0}</p>
              <p className="text-xs text-vapor">12kg</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Invoice</h2>
        {(!invoices || invoices.length === 0) ? (
          <p className="text-sm text-muted-foreground">Belum ada invoice.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <Link key={inv.id} href={`/invoice/${inv.id}`} className="block rounded-lg border bg-card p-3 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{inv.nomor_invoice}</p>
                    <p className="text-xs text-muted-foreground">{inv.tanggal_invoice} &middot; {inv.items?.length || 0} item</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={inv.status} />
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatRupiah(inv.total)}</p>
                  </div>
                </div>
                {inv.total_dibayar > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <div className="flex-1 rounded-full bg-muted h-1.5">
                      <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, (inv.total_dibayar / inv.total) * 100)}%` }} />
                    </div>
                    <span className="text-muted-foreground">{formatRupiah(inv.total_dibayar)} / {formatRupiah(inv.total)}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Riwayat Pengiriman</h2>
        {(!schedules || schedules.length === 0) ? (
          <p className="text-sm text-muted-foreground">Belum ada pengiriman.</p>
        ) : (
          <div className="space-y-2">
            {schedules.map((s: any) => (
              <div key={s.id} className="rounded-lg border bg-card p-3 flex items-center justify-between text-sm">
                <div>
                  <p>{s.tanggal_rencana}</p>
                  <p className="text-xs text-muted-foreground">{s.sopir || "-"} &middot; {s.nomor_kendaraan || "-"}</p>
                  {(s.tabung_3kg > 0 || s.tabung_5kg > 0 || s.tabung_12kg > 0) && (
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {s.tabung_3kg > 0 && <span className="text-info">3kg: {s.tabung_3kg}</span>}
                      {s.tabung_5kg > 0 && <span className="text-warning">5kg: {s.tabung_5kg}</span>}
                      {s.tabung_12kg > 0 && <span className="text-vapor">12kg: {s.tabung_12kg}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p>{(s.tabung_3kg || 0) + (s.tabung_5kg || 0) + (s.tabung_12kg || 0)} tabung</p>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}