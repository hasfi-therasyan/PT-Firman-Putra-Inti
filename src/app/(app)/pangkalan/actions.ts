"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearchTerm } from "@/lib/utils/postgrest";

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

export async function getPangkalanList(filters?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const limit = filters?.limit || 20;
  const page = filters?.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("pangkalan")
    .select("*", { count: "exact" })
    .order("nama")
    .range(from, to);

  if (filters?.search) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      query = query.or(`nama.ilike.%${term}%,kode.ilike.%${term}%`);
    }
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
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
