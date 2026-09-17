"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Delete a payment transaction AND record the gmail_message_id in
 * processed_gmail_ids so the same email is never re-ingested.
 */
export async function deletePaymentTransaction(id: string) {
  // Fetch the record first to get gmail_message_id
  const { data: record, error: fetchError } = await supabaseAdmin
    .from("payment_transactions")
    .select("id, gmail_message_id")
    .eq("id", id)
    .single();

  if (fetchError || !record) throw new Error("Transaksi tidak ditemukan");

  const rec = record as { id: string; gmail_message_id: string | null };

  // Record gmail_message_id to prevent re-ingestion
  if (rec.gmail_message_id) {
    await supabaseAdmin
      .from("processed_gmail_ids" as never)
      .upsert(
        { gmail_message_id: rec.gmail_message_id } as never,
        { onConflict: "gmail_message_id" }
      );
  }

  // Also delete any payment_matches referencing this transaction
  await supabaseAdmin
    .from("payment_matches")
    .delete()
    .eq("payment_transaction_id", id);

  // Delete the transaction
  const { error } = await supabaseAdmin
    .from("payment_transactions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/pembayaran");
  revalidatePath("/invoice");
  revalidatePath("/dashboard");
}
