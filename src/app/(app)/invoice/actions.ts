"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateInvoiceNumber, generateKodeUnik } from "@/lib/domain/invoice";
import { calculateTotal } from "@/lib/domain/invoice";
import { sanitizeSearchTerm } from "@/lib/utils/postgrest";

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, nama, harga")
    .eq("is_active", true)
    .order("harga");
  if (error) throw new Error(error.message);
  return data;
}

export async function getActivePangkalan() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pangkalan")
    .select("id, nama, kode")
    .eq("status", "aktif")
    .order("nama");
  if (error) throw new Error(error.message);
  return data;
}

export async function getSchedulesForPangkalan(pangkalanId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_schedules")
    .select("id, tanggal_rencana, jumlah_tabung, status")
    .eq("pangkalan_id", pangkalanId)
    .in("status", ["selesai", "dijadwalkan", "dikirim"])
    .order("tanggal_rencana", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export interface InvoiceItemInput {
  deskripsi: string;
  qty: number;
  unit_price: number;
}

export interface InvoiceInput {
  pangkalan_id: string;
  delivery_schedule_id?: string;
  items: InvoiceItemInput[];
  penyesuaian?: number;
  tanggal_jatuh_tempo: string;
}

/**
 * Create a new invoice from items with price snapshot and kode_unik.
 */
export async function createInvoice(data: InvoiceInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Calculate subtotal from items (server-side)
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.qty * item.unit_price,
    0
  );

  // Get settings for invoice numbering and kode_unik
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("*")
    .single();

  const settingsAny = settings as Record<string, unknown> | null;
  const format = (settingsAny?.invoice_number_format as string) || "INV/YYYY/MM/NNNN";
  const kodeUnikEnabled = (settingsAny?.kode_unik_enabled as boolean) ?? true;

  // Count existing invoices for numbering
  const { count } = await supabaseAdmin
    .from("invoices")
    .select("id", { count: "exact", head: true });

  const nomorInvoice = generateInvoiceNumber(format, (count || 0) + 1);

  // Generate kode_unik
  let kodeUnik = 0;
  if (kodeUnikEnabled) {
    const { data: unpaidKodes } = await supabaseAdmin
      .from("invoices")
      .select("kode_unik")
      .in("status", ["draft", "issued", "partial", "overdue"]);

    const existing = (unpaidKodes as Array<{kode_unik: number | null}> | null)?.map((k) => k.kode_unik).filter((k): k is number => k != null) ?? [];
    kodeUnik = generateKodeUnik(existing);
  }

  const penyesuaian = data.penyesuaian || 0;
  const total = calculateTotal(subtotal, penyesuaian, kodeUnik);

  // Date calculations
  const tanggalInvoice = new Date().toISOString().split("T")[0];
  const jatuhTempo = new Date(
    Date.now() + 30 * 86400000
  ).toISOString().split("T")[0];

  // Create invoice
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      nomor_invoice: nomorInvoice,
      pangkalan_id: data.pangkalan_id,
      delivery_schedule_id: data.delivery_schedule_id || null,
      tanggal_invoice: tanggalInvoice,
      tanggal_jatuh_tempo: data.tanggal_jatuh_tempo || jatuhTempo,
      subtotal,
      penyesuaian,
      kode_unik: kodeUnik,
      total,
      total_dibayar: 0,
      status: "issued",
      created_by: user.id,
    } as never)
    .select("id")
    .single();

  if (invError) throw new Error(invError.message);

  // Create invoice items
  const items = data.items.map((item) => ({
    invoice_id: invoice.id,
    deskripsi: item.deskripsi,
    qty: item.qty,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase.from("invoice_items").insert(items as never);
  if (itemsError) throw new Error(itemsError.message);

  // If linked to a delivery schedule, mark as selesai
  if (data.delivery_schedule_id) {
    await supabase
      .from("delivery_schedules")
      .update({ status: "selesai" } as never)
      .eq("id", data.delivery_schedule_id);
  }

  revalidatePath("/invoice");
  return { id: invoice.id, nomor: nomorInvoice };
}

export async function getInvoiceList(filters?: {
  status?: string;
  pangkalan_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const limit = filters?.limit || 20;
  const page = filters?.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("invoices")
    .select("*, pangkalan:pangkalan_id(nama, kode)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.pangkalan_id) query = query.eq("pangkalan_id", filters.pangkalan_id);
  
  if (filters?.search) {
    const term = sanitizeSearchTerm(filters.search);

    if (term) {
      // PostgREST logic trees cannot filter embedded resources, so resolve the
      // matching pangkalan ids first and then OR them against the invoice number.
      const { data: matchedPangkalan } = await supabase
        .from("pangkalan")
        .select("id")
        .ilike("nama", `%${term}%`);

      const ids = (matchedPangkalan || []).map((p) => p.id);

      if (ids.length > 0) {
        query = query.or(
          `nomor_invoice.ilike.%${term}%,pangkalan_id.in.(${ids.join(",")})`
        );
      } else {
        query = query.ilike("nomor_invoice", `%${term}%`);
      }
    }
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, pangkalan:pangkalan_id(nama, kode, alamat), items:invoice_items(*)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
