"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface JadwalInput {
  pangkalan_id: string;
  tanggal_rencana: string;
  jumlah_tabung: number;
  tabung_3kg?: number;
  tabung_5kg?: number;
  tabung_12kg?: number;
  nomor_kendaraan?: string;
  sopir?: string;
  catatan?: string;
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

export async function createJadwal(data: JadwalInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("delivery_schedules").insert({
    ...data,
    status: "dijadwalkan",
    created_by: user.id,
  } as never);

  if (error) throw new Error(error.message);
  revalidatePath("/jadwal");
}

export async function updateJadwalStatus(
  id: string,
  status: "draft" | "dijadwalkan" | "dikirim" | "selesai" | "dibatalkan",
  tanggal_aktual?: string
) {
  const admin = supabaseAdmin;
  const update: Record<string, unknown> = { status };
  if (tanggal_aktual) update.tanggal_aktual = tanggal_aktual;

  const { error } = await admin
    .from("delivery_schedules")
    .update(update as never)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/jadwal");
  revalidatePath(`/jadwal/${id}`);
}

export async function getJadwalList(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("delivery_schedules")
    .select("*, pangkalan:pangkalan_id(nama, kode)")
    .order("tanggal_rencana", { ascending: false });

  if (dateFrom) query = query.gte("tanggal_rencana", dateFrom);
  if (dateTo) query = query.lte("tanggal_rencana", dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getJadwalById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_schedules")
    .select("*, pangkalan:pangkalan_id(id, nama, kode, harga_per_tabung)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
