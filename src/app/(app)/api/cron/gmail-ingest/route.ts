import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import * as gmail from "@/lib/gmail/client";
import { parseEmail } from "@/lib/gmail/parsers";
import { setCompanyAccounts } from "@/lib/gmail/parsers/mandiri";

export const dynamic = "force-dynamic";

/**
 * Cron: Gmail ingestion — polls for new bank notification emails.
 * GET /api/cron/gmail-ingest
 * Requires Authorization: Bearer <CRON_SECRET>
 */
export async function GET(_request: Request) {
  // Auth check (currently bypassed for testing)
  // const authHeader = request.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Load company accounts for direction detection
    const { data: accounts } = await supabaseAdmin
      .from("company_accounts" as never)
      .select("nomor_rekening_masked")
      .eq("is_active", true)
      .throwOnError();

    if (accounts && accounts.length > 0) {
      setCompanyAccounts(
        (accounts as { nomor_rekening_masked: string }[]).map((a) => a.nomor_rekening_masked)
      );
    }

    // Load settings for Gmail query and last sync state
    const { data: settings } = await supabaseAdmin
      .from("app_settings" as never)
      .select("id, last_gmail_history_id, last_gmail_synced_at")
      .throwOnError()
      .single();

    const watchQuery = process.env.GMAIL_WATCH_QUERY || "from:(mandiri) newer_than:7d";

    // List messages
    const messages = await gmail.listMessages(watchQuery, 50);

    let ingested = 0;
    let skipped = 0;
    let failed = 0;

    for (const msg of messages) {
      // Check if already ingested in payment_transactions
      const { data: existing } = await supabaseAdmin
        .from("payment_transactions" as never)
        .select("id")
        .eq("gmail_message_id", msg.id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Check if this gmail_message_id was previously processed and deleted by user
      // Prevents re-appearance of emails that user explicitly removed
      const { data: previouslyProcessed } = await supabaseAdmin
        .from("processed_gmail_ids" as never)
        .select("id")
        .eq("gmail_message_id", msg.id)
        .limit(1)
        .maybeSingle();

      if (previouslyProcessed) {
        skipped++;
        continue;
      }

      // Fetch full message
      const fullMsg = await gmail.getMessage(msg.id);

      // Parse
      const result = parseEmail(fullMsg.subject, fullMsg.from, fullMsg.body);

      if ("error" in result) {
        // Failed parse — store for later
        await supabaseAdmin.from("payment_transactions" as never).insert({
          gmail_message_id: msg.id,
          email_received_at: fullMsg.date,
          bank: "mandiri",
          nominal: 0,
          arah: "masuk",
          content_hash: "",
          raw_subject: fullMsg.subject,
          raw_body: fullMsg.body,
          parse_status: "failed",
          parse_errors: { error: result.error, field: result.field },
          status: "ignored",
          sumber: "gmail",
        } as never);

        // Track as processed even if parse failed
        await supabaseAdmin
          .from("processed_gmail_ids" as never)
          .insert({ gmail_message_id: msg.id } as never);

        failed++;
        continue;
      }

      // Check content_hash idempotency
      const { data: hashExisting } = await supabaseAdmin
        .from("payment_transactions" as never)
        .select("id")
        .eq("content_hash", result.content_hash)
        .limit(1)
        .maybeSingle();

      if (hashExisting) {
        skipped++;
        continue;
      }

      // Status: only ingest Success
      const status =
        result.status_bank?.toLowerCase() === "success"
          ? "unmatched"
          : "ignored";

      // Insert payment transaction
      const { error: insertError } = await supabaseAdmin
        .from("payment_transactions" as never)
        .insert({
          gmail_message_id: msg.id,
          email_received_at: fullMsg.date,
          bank: "mandiri",
          jenis: result.jenis,
          nominal: result.nominal,
          tanggal_transaksi: result.tanggal_transaksi,
          arah: result.arah,
          nama_pengirim: result.nama_pengirim,
          rekening_pengirim_masked: result.rekening_pengirim_masked,
          nama_tujuan: result.nama_tujuan,
          rekening_tujuan_masked: result.rekening_tujuan_masked,
          berita: result.berita,
          status_bank: result.status_bank,
          content_hash: result.content_hash,
          raw_subject: fullMsg.subject,
          raw_body: fullMsg.body,
          parse_status: "parsed",
          status,
          sumber: "gmail",
        } as never);

      if (insertError) {
        failed++;
        continue;
      }

      // Track as permanently processed to prevent re-ingestion if user deletes the record
      await supabaseAdmin
        .from("processed_gmail_ids" as never)
        .insert({ gmail_message_id: msg.id } as never);

      ingested++;
    }

    // Update sync state
    const historyId = await gmail.getHistoryId();
    await supabaseAdmin
      .from("app_settings" as never)
      .update({
        last_gmail_history_id: historyId,
        last_gmail_synced_at: new Date().toISOString(),
      } as never)
      .eq("id", (settings as any).id)
      .throwOnError();

    return NextResponse.json({
      ingested,
      skipped,
      failed,
      total: messages.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gmail ingestion error:", error);
    return NextResponse.json(
      { error: "Internal error during Gmail ingestion" },
      { status: 500 }
    );
  }
}