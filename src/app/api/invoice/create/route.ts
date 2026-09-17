import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateInvoiceNumber, generateKodeUnik, calculateTotal } from '@/lib/domain/invoice';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { pangkalan_id, delivery_schedule_id, tanggal_invoice, tanggal_jatuh_tempo, items, penyesuaian = 0 } = body;

    if (!pangkalan_id || !tanggal_invoice || !tanggal_jatuh_tempo || !items?.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.deskripsi || !item.qty || item.qty <= 0 || !item.unit_price || item.unit_price <= 0) {
        return NextResponse.json({ error: 'Item invoice tidak valid' }, { status: 400 });
      }
    }

    const admin = supabaseAdmin;

    // Validate pangkalan exists
    const { data: pangkalan } = await admin.from('pangkalan').select('id, nama').eq('id', pangkalan_id).single();
    if (!pangkalan) return NextResponse.json({ error: 'Pangkalan tidak ditemukan' }, { status: 404 });

    // Calculate subtotal server-side
    const subtotal = items.reduce((sum: number, item: { qty: number; unit_price: number }) => sum + item.qty * item.unit_price, 0);

    // Generate kode_unik
    const { data: unpaidInvoices } = await admin
      .from('invoices')
      .select('kode_unik')
      .in('status', ['draft', 'issued', 'partial', 'overdue']);
    const existingKodes = (unpaidInvoices || []).map((i: { kode_unik: number | null }) => i.kode_unik).filter((k): k is number => k != null);
    const kode_unik = generateKodeUnik(existingKodes);

    const total = calculateTotal(subtotal, penyesuaian, kode_unik);

    // Generate invoice number
    const { count } = await admin.from('invoices').select('id', { count: 'exact', head: true });
    const nomor_invoice = generateInvoiceNumber('INV/YYYY/MM/NNNN', (count || 0) + 1);

    // Insert invoice
    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .insert({
        nomor_invoice,
        pangkalan_id,
        delivery_schedule_id: delivery_schedule_id || null,
        tanggal_invoice,
        tanggal_jatuh_tempo,
        subtotal,
        penyesuaian,
        kode_unik,
        total,
        total_dibayar: 0,
        status: 'issued',
        created_by: user.id,
      } as never)
      .select('id')
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: (invErr as Error | null)?.message || 'Gagal membuat invoice' }, { status: 500 });
    }

    const invId = (invoice as { id: string }).id;

    // Insert items
    const invoiceItems = items.map((item: { deskripsi: string; qty: number; unit_price: number }) => ({
      invoice_id: invId,
      deskripsi: item.deskripsi,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.qty * item.unit_price,
    }));

    const { error: itemsErr } = await admin.from('invoice_items').insert(invoiceItems as never);
    if (itemsErr) {
      await admin.from('invoices').delete().eq('id', invId);
      return NextResponse.json({ error: (itemsErr as Error).message }, { status: 500 });
    }

    // Link delivery schedule
    if (delivery_schedule_id) {
      await admin.from('delivery_schedules').update({ status: 'selesai' } as never).eq('id', delivery_schedule_id);
    }

    // Audit
    await admin.from('audit_logs').insert({
      table_name: 'invoices', record_id: invId, action: 'insert',
      new_values: { nomor_invoice, pangkalan_id, total, status: 'issued' },
      actor: user.id, reason: 'Invoice dibuat',
    } as never);

    return NextResponse.json({ invoiceId: invId, nomor_invoice });
  } catch (error: unknown) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
