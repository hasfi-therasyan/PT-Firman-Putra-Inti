"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PangkalanInput {
  nama: string;
  kode: string;
  alamat?: string;
  kecamatan?: string;
  kota?: string;
  telepon?: string;
  pic_nama?: string;
  kuota_tabung_bulanan?: number;
  tabung_3kg?: number;
  tabung_5kg?: number;
  tabung_12kg?: number;
  status?: "aktif" | "nonaktif";
  catatan?: string;
}

export async function createPangkalan(data: PangkalanInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("pangkalan").insert({
    ...data,
    harga_per_tabung: 0, // System calculates prices from products table
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/pangkalan");
}

export async function updatePangkalan(id: string, data: Partial<PangkalanInput>) {
  const supabase = await createClient();
  const { error } = await supabase.from("pangkalan").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pangkalan");
}

export async function deletePangkalan(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pangkalan").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pangkalan");
}

export async function getPangkalanList(search?: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("pangkalan")
    .select("*")
    .order("nama");

  if (search) {
    query = query.or(`nama.ilike.%${search}%,kode.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getPangkalanById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pangkalan")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
