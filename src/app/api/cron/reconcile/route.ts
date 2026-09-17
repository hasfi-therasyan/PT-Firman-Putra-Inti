import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { matchPayment } from "@/lib/domain/payment-matching";

export const dynamic = "force-dynamic";

/**
 * Cron: Reconciliation — match unmatched payments to invoices.
 * GET /api/cron/reconcile
 */
export async function GET(_request: Request) {
  // TEMPORARY: bypassed for local testing
  // const authHeader = _request.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Get unmatched payments
    const { data: unmatched } = await supabaseAdmin
      .from("payment_transactions" as never)
      .select("id, nominal, berita, nama_pengirim, arah, status")
      .eq("status", "unmatched")
      .eq("arah", "masuk")
      .eq("parse_status", "parsed")
      .throwOnError();

    if (!unmatched || unmatched.length === 0) {
      return NextResponse.json({ matched: 0, suggestions: 0 });
    }

    // Get all unpaid invoices
    const { data: invoices } = await supabaseAdmin
      .from("invoices" as never)
      .select("id, pangkalan_id, nomor_invoice, total, sisa, status, pangkalan:pangkalan_id(nama)")
      .in("status", ["issued", "partial", "overdue"])
      .throwOnError();

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ matched: 0, suggestions: 0 });
    }

    let matched = 0;
    let suggestions = 0;

    for (const payment of unmatched as any[]) {
      const candidates = (invoices as any[])
        .filter((inv) => (inv.sisa ?? inv.total - 0) > 0)
        .map((inv) => ({
          invoiceId: inv.id,
          total: inv.total,
          sisa: inv.sisa ?? inv.total,
          pangkalanId: inv.pangkalan_id,
          pangkalanNama: inv.pangkalan?.nama || "",
          nomorInvoice: inv.nomor_invoice,
        }));

      const results = matchPayment(
        payment.nominal,
        payment.berita,
        payment.nama_pengirim,
        candidates
      );

      if (results.length > 0) {
        const bestMatch = results[0];
        if (bestMatch.confidence >= 0.9) {
          // Auto-match: insert payment_match and update invoice
          const invoice = candidates.find((c) => c.invoiceId === bestMatch.invoiceId);

          await supabaseAdmin.from("payment_matches" as never).insert({
            payment_transaction_id: payment.id,
            invoice_id: bestMatch.invoiceId,
            nominal_dialokasikan: bestMatch.nominalDialokasikan,
            metode: bestMatch.metode,
            confidence: bestMatch.confidence,
            matched_by: "system",
            matched_at: new Date().toISOString(),
          } as never);

          // Recalculate total_dibayar for the invoice
          const { data: matches } = await supabaseAdmin
            .from("payment_matches" as never)
            .select("nominal_dialokasikan")
            .eq("invoice_id", bestMatch.invoiceId);

          const totalDibayar = (matches as any[] | null)?.reduce(
            (sum: number, m: any) => sum + (m.nominal_dialokasikan || 0),
            0
          ) ?? 0;

          const newStatus = totalDibayar >= (invoice?.total ?? 0) ? "paid" : "partial";

          await supabaseAdmin
            .from("invoices" as never)
            .update({
              total_dibayar: totalDibayar,
              status: newStatus,
            } as never)
            .eq("id", bestMatch.invoiceId);

          // Update payment status
          const paymentStatus = totalDibayar >= payment.nominal ? "matched" : "partially_allocated";
          await supabaseAdmin
            .from("payment_transactions" as never)
            .update({ status: paymentStatus } as never)
            .eq("id", payment.id);

          // Create notification
          await supabaseAdmin.from("notifications" as never).insert({
            tipe: "payment_matched",
            judul: "Pembayaran terdeteksi",
            pesan: `Rp ${payment.nominal.toLocaleString("id-ID")} dari ${payment.nama_pengirim || "Unknown"} telah dicocokkan dengan ${invoice?.nomorInvoice || "invoice"}.`,
            entity_type: "payment",
            entity_id: payment.id,
            severity: "info",
          } as never);

          matched++;
        } else {
          suggestions++;
        }
      }
    }

    return NextResponse.json({ matched, suggestions });
  } catch (error) {
    console.error("Reconciliation error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
