import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Cron: Check for overdue invoices and create notifications.
 * GET /api/cron/overdue-check
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Find issued/partial invoices past due date
    const { data: overdue } = await supabaseAdmin
      .from("invoices" as never)
      .select("id, nomor_invoice, pangkalan_id, total, total_dibayar, tanggal_jatuh_tempo, pangkalan:pangkalan_id(nama)")
      .in("status", ["issued", "partial"])
      .lt("tanggal_jatuh_tempo", today)
      .throwOnError();

    if (!overdue || overdue.length === 0) {
      return NextResponse.json({ updated: 0, notifications: 0 });
    }

    let updated = 0;
    let notifications = 0;

    for (const inv of overdue as any[]) {
      // Update status to overdue
      const { error: updateErr } = await supabaseAdmin
        .from("invoices" as never)
        .update({ status: "overdue" } as never)
        .eq("id", inv.id)
        .eq("status", inv.total_dibayar > 0 ? "partial" : "issued");

      if (!updateErr) updated++;

      // Create notification if not already notified
      const { data: existing } = await supabaseAdmin
        .from("notifications" as never)
        .select("id")
        .eq("entity_type", "invoice")
        .eq("entity_id", inv.id)
        .eq("tipe", "overdue")
        .limit(1)
        .maybeSingle();

      if (!existing) {
        const pangkalanNama = (inv.pangkalan as any)?.nama || "Unknown";
        await supabaseAdmin.from("notifications" as never).insert({
          tipe: "overdue",
          judul: `Invoice ${inv.nomor_invoice} jatuh tempo`,
          pesan: `Invoice dari ${pangkalanNama} sebesar Rp ${(inv.total - inv.total_dibayar).toLocaleString("id-ID")} telah melewati jatuh tempo.`,
          entity_type: "invoice",
          entity_id: inv.id,
          severity: "critical",
        } as never);
        notifications++;
      }
    }

    return NextResponse.json({ updated, notifications });
  } catch (error) {
    console.error("Overdue check error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
