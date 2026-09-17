"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function updateSettings(data: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("app_settings").select("id").single();
  if (!settings) throw new Error("Settings not found");
  const { error } = await supabaseAdmin.from("app_settings").update(data as never).eq("id", settings.id);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}

export async function updateCompanyProfile(data: {
  company_name: string;
  company_address?: string;
  company_npwp?: string;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("app_settings").select("id").single();
  if (!settings) throw new Error("Settings not found");
  const { error } = await supabaseAdmin
    .from("app_settings")
    .update({
      company_name: data.company_name,
      company_address: data.company_address || null,
      company_npwp: data.company_npwp || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", settings.id);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}

export async function updateInvoiceSettings(data: {
  invoice_number_format: string;
  default_payment_terms_days: number;
  kode_unik_enabled: boolean;
  reconciliation_tolerance: number;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("app_settings").select("id").single();
  if (!settings) throw new Error("Settings not found");
  const { error } = await supabaseAdmin
    .from("app_settings")
    .update({
      invoice_number_format: data.invoice_number_format,
      default_payment_terms_days: data.default_payment_terms_days,
      kode_unik_enabled: data.kode_unik_enabled,
      reconciliation_tolerance: data.reconciliation_tolerance,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", settings.id);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}

export async function addCompanyAccount(data: {
  nama_rekening: string;
  bank: string;
  nomor_rekening_masked: string;
}) {
  const { error } = await supabaseAdmin.from("company_accounts").insert({
    ...data,
    is_active: true,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}

export async function deleteCompanyAccount(id: string) {
  const { error } = await supabaseAdmin.from("company_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}

export async function toggleCompanyAccount(id: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from("company_accounts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pengaturan");
}
