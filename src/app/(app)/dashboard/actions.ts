"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  pangkalan_id?: string;
}

interface InvoiceRow {
  id: string;
  nomor_invoice: string;
  total: number;
  total_dibayar: number;
  sisa?: number | null;
  status: string;
  tanggal_invoice: string;
  pangkalan?: { id: string; nama: string; kode: string } | null;
}

interface OverdueInvoice {
  id: string;
  nomor_invoice: string;
  total: number;
  total_dibayar: number;
  sisa?: number | null;
  tanggal_jatuh_tempo: string;
  pangkalan?: { nama: string } | null;
}

interface PaymentRow {
  id: string;
  nominal: number;
  arah: string;
  status_bank: string;
  nama_pengirim?: string | null;
  created_at: string;
  tanggal_transaksi?: string | null;
}

interface ScheduleRow {
  id: string;
  tanggal_rencana: string;
  jumlah_tabung: number;
  tabung_3kg: number;
  tabung_5kg: number;
  tabung_12kg: number;
  status: string;
  pangkalan?: { nama: string } | null;
}

interface PangkalanRow {
  id: string;
  nama: string;
  kode: string;
  tabung_3kg: number;
  tabung_5kg: number;
  tabung_12kg: number;
  status: string;
}

export async function getDashboardData(filters?: DashboardFilters) {
  const supabase = await createClient();
  const dateFrom = filters?.dateFrom || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
  const dateTo = filters?.dateTo || new Date().toISOString().split("T")[0];

  const [invoicesRes, overdueRes, paymentsRes, schedulesRes, pangkalanRes] = await Promise.all([
    supabase.from("invoices")
      .select("id, nomor_invoice, total, total_dibayar, sisa, status, tanggal_invoice, pangkalan:pangkalan_id(id, nama, kode)")
      .gte("tanggal_invoice", dateFrom).lte("tanggal_invoice", dateTo)
      .not("status", "eq", "cancelled"),
    supabase.from("invoices")
      .select("id, nomor_invoice, total, total_dibayar, sisa, tanggal_jatuh_tempo, pangkalan:pangkalan_id(nama)")
      .eq("status", "overdue"),
    supabase.from("payment_transactions")
      .select("id, nominal, arah, status_bank, nama_pengirim, created_at, tanggal_transaksi")
      .gte("created_at", dateFrom + "T00:00:00").lte("created_at", dateTo + "T23:59:59"),
    supabase.from("delivery_schedules")
      .select("id, tanggal_rencana, jumlah_tabung, tabung_3kg, tabung_5kg, tabung_12kg, status, pangkalan:pangkalan_id(nama)")
      .gte("tanggal_rencana", dateFrom).lte("tanggal_rencana", dateTo),
    supabase.from("pangkalan")
      .select("id, nama, kode, tabung_3kg, tabung_5kg, tabung_12kg, status")
      .eq("status", "aktif"),
  ]);

  // Supabase returns nested relations as arrays; normalize to single object or null
  const normalizePangkalan = <T extends { pangkalan?: any }>(rows: T[]): (Omit<T, 'pangkalan'> & { pangkalan?: { id?: string; nama: string; kode?: string } | null })[] => {
    return rows.map(r => ({
      ...r,
      pangkalan: Array.isArray(r.pangkalan) ? r.pangkalan[0] ?? null : r.pangkalan ?? null
    }));
  };

  const invoices = normalizePangkalan(invoicesRes.data ?? []) as InvoiceRow[];
  const overdue = normalizePangkalan(overdueRes.data ?? []) as OverdueInvoice[];
  const payments: PaymentRow[] = (paymentsRes.data ?? []).filter((p) => p.arah === "masuk" && p.status_bank === "Success");
  const schedules = normalizePangkalan(schedulesRes.data ?? []) as ScheduleRow[];
  const pangkalan: PangkalanRow[] = pangkalanRes.data ?? [];

  const totalOutstanding = invoices
    .filter((i) => !["paid"].includes(i.status))
    .reduce((s, i) => s + ((i.sisa ?? i.total - i.total_dibayar) || 0), 0);
  const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + (p.nominal || 0), 0);

  return {
    summary: {
      totalOutstanding, totalInvoiced, totalPaid,
      overdueCount: overdue.length,
      overdueTotal: overdue.reduce((s, i) => s + ((i.total || 0) - (i.total_dibayar || 0)), 0),
      invoiceCount: invoices.length,
      scheduleCount: schedules.length,
      totalTabung: schedules.reduce((s, j) => s + (j.jumlah_tabung || 0), 0),
      tabung3kg: schedules.reduce((s, j) => s + (j.tabung_3kg || 0), 0),
      tabung5kg: schedules.reduce((s, j) => s + (j.tabung_5kg || 0), 0),
      tabung12kg: schedules.reduce((s, j) => s + (j.tabung_12kg || 0), 0),
    },
    monthly: buildMonthlyData(invoices, payments),
    statusBreakdown: buildStatusBreakdown(invoices),
    pangkalanRanking: buildPangkalanRanking(invoices, pangkalan),
    scheduleStatus: buildScheduleStatus(schedules),
    tabungByPangkalan: pangkalan.slice(0, 10).map(p => ({
      name: p.nama.length > 12 ? p.nama.slice(0, 12) + "…" : p.nama,
      "3kg": p.tabung_3kg || 0, "5kg": p.tabung_5kg || 0, "12kg": p.tabung_12kg || 0,
    })),
    recentPayments: payments.slice(0, 10),
    overdueList: overdue.slice(0, 10),
    pangkalanList: pangkalan.map(p => ({ id: p.id, nama: p.nama })),
  };
}

function buildMonthlyData(invoices: InvoiceRow[], payments: PaymentRow[]) {
  const months: { label: string; invoiced: number; paid: number }[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    months.push({
      label,
      invoiced: invoices.filter((i) => i.tanggal_invoice?.startsWith(prefix)).reduce((s, i) => s + (i.total || 0), 0),
      paid: payments.filter((p) => (p.tanggal_transaksi || p.created_at)?.startsWith(prefix)).reduce((s, p) => s + (p.nominal || 0), 0),
    });
  }
  return months;
}

function buildStatusBreakdown(invoices: InvoiceRow[]) {
  // Status pie memakai hue kategoris yang tidak dipakai bar uang (chart-5/chart-6):
  // Diterbitkan = violet, Sebagian = tangerine, Lunas = cyan,
  // Jatuh Tempo = destructive (merah, semantik bahaya), Draft = abu netral.
  const map: Record<string, { label: string; color: string }> = {
    issued: { label: "Diterbitkan", color: "var(--chart-2)" },
    partial: { label: "Sebagian", color: "var(--chart-1)" },
    paid: { label: "Lunas", color: "var(--chart-3)" },
    overdue: { label: "Jatuh Tempo", color: "var(--destructive)" },
    draft: { label: "Draft", color: "var(--muted-foreground)" },
  };
  return Object.entries(map)
    .map(([status, meta]) => ({ name: meta.label, value: invoices.filter((i) => i.status === status).length, color: meta.color }))
    .filter((item) => item.value > 0);
}

function buildPangkalanRanking(invoices: InvoiceRow[], pangkalan: PangkalanRow[]) {
  const map = new Map<string, { nama: string; totalInvoiced: number; totalPaid: number }>();
  pangkalan.forEach((p) => map.set(p.id, { nama: p.nama, totalInvoiced: 0, totalPaid: 0 }));
  invoices.forEach((inv) => {
    const id = inv.pangkalan?.id || inv.pangkalan?.nama;
    const e = map.get(id ?? "");
    if (e) { e.totalInvoiced += inv.total || 0; e.totalPaid += inv.total_dibayar || 0; }
  });
  return [...map.values()].sort((a, b) => b.totalInvoiced - a.totalInvoiced).slice(0, 10);
}

function buildScheduleStatus(schedules: ScheduleRow[]) {
  // Status pengiriman memakai hue yang tidak dipakai pie invoice:
  // Dijadwalkan = golden-yellow, Dikirim = magenta-pink,
  // Selesai = spring-green, Dibatalkan = abu netral.
  const colors: Record<string, string> = { dijadwalkan: "var(--chart-6)", dikirim: "var(--chart-4)", selesai: "var(--chart-5)", dibatalkan: "var(--muted-foreground)" };
  const labels: Record<string, string> = { dijadwalkan: "Dijadwalkan", dikirim: "Dikirim", selesai: "Selesai", dibatalkan: "Dibatalkan" };
  const counts: Record<string, number> = {};
  schedules.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
  return Object.entries(counts).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "var(--muted-foreground)" }));
}