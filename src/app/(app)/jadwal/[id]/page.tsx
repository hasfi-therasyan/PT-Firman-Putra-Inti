
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: _data } = await supabase.from("delivery_schedules").select("id").eq("id", id).single();
  return { title: "Detail Jadwal" };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-700" },
  dijadwalkan: { label: "Dijadwalkan", cls: "bg-blue-100 text-blue-700" },
  dikirim: { label: "Dikirim", cls: "bg-yellow-100 text-yellow-700" },
  selesai: { label: "Selesai", cls: "bg-green-100 text-green-700" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-500" },
};

async function markSelesai(id: string) {
  const admin = supabaseAdmin;
  const { error } = await admin
    .from('delivery_schedules')
    .update({ status: 'selesai', tanggal_aktual: new Date().toISOString().split('T')[0] } as never)
    .eq('id', id);
  if (!error) {
    revalidatePath(`/jadwal/${id}`);
    revalidatePath('/jadwal');
  }
}

export default async function JadwalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("delivery_schedules")
    .select("*, pangkalan:pangkalan_id(nama, kode, alamat, telepon, pic_nama)")
    .eq("id", id)
    .single();

  if (!schedule) notFound();

  // Check if invoice exists for this schedule
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, nomor_invoice, total, status")
    .eq("delivery_schedule_id", id)
    .maybeSingle();

  const pangkalan = schedule.pangkalan as any;
  const st = STATUS_MAP[schedule.status] || { label: schedule.status, cls: "bg-gray-100" };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <Link href="/jadwal" className="text-xs text-muted-foreground hover:underline">&larr; Kembali</Link>
        <div className="mt-1 flex items-start justify-between">
          <h1 className="text-2xl font-bold">Detail Jadwal</h1>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Pangkalan</span><Link href={`/pangkalan/${pangkalan?.id || ""}`} className="font-medium text-primary hover:underline">{pangkalan?.nama || "-"}</Link></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Rencana</span><span className="font-medium">{schedule.tanggal_rencana}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Aktual</span><span className="font-medium">{schedule.tanggal_aktual || "-"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Jumlah Tabung</span><span className="font-medium">{schedule.jumlah_tabung}</span></div>
        {(schedule.tabung_3kg > 0 || schedule.tabung_5kg > 0 || schedule.tabung_12kg > 0) && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-md bg-blue-50 px-2 py-1 text-center"><p className="text-xs text-blue-600">3kg</p><p className="font-semibold text-blue-700">{schedule.tabung_3kg}</p></div>
            <div className="rounded-md bg-amber-50 px-2 py-1 text-center"><p className="text-xs text-amber-600">5kg</p><p className="font-semibold text-amber-700">{schedule.tabung_5kg}</p></div>
            <div className="rounded-md bg-purple-50 px-2 py-1 text-center"><p className="text-xs text-purple-600">12kg</p><p className="font-semibold text-purple-700">{schedule.tabung_12kg}</p></div>
          </div>
        )}
        <div className="flex justify-between"><span className="text-muted-foreground">Kendaraan</span><span className="font-medium">{schedule.nomor_kendaraan || "-"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Sopir</span><span className="font-medium">{schedule.sopir || "-"}</span></div>
        {pangkalan?.pic_nama && <div className="flex justify-between"><span className="text-muted-foreground">PIC</span><span className="font-medium">{pangkalan.pic_nama}</span></div>}
        {pangkalan?.telepon && <div className="flex justify-between"><span className="text-muted-foreground">Telepon</span><span className="font-medium">{pangkalan.telepon}</span></div>}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Invoice Terkait</h2>
        {invoice ? (
          <Link href={`/invoice/${invoice.id}`} className="block rounded-lg border bg-card p-3 hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{invoice.nomor_invoice}</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {invoice.status === "paid" ? "Lunas" : "Diterbitkan"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {schedule.status === "selesai" ? (
              <Link href={`/invoice/new?schedule=${schedule.id}&pangkalan=${pangkalan?.id || ""}`} className="block text-center text-primary font-medium hover:underline">Buat Invoice &rarr;</Link>
            ) : schedule.status === "dikirim" ? (
              <form action={() => markSelesai(id)} className="space-y-2">
                <p className="text-sm text-muted-foreground">Tandai pengiriman selesai untuk membuat invoice</p>
                <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">Tandai Selesai</button>
              </form>
            ) : (
              <p className="text-center text-sm text-muted-foreground">Belum ada invoice. Status harus Selesai atau Dikirim.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}