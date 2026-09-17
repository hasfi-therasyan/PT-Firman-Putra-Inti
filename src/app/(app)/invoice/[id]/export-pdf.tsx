'use client';

type InvoiceItem = { deskripsi: string; qty: number; unit_price: number; line_total: number };

interface InvoicePDFData {
  nomor_invoice: string;
  tanggal_invoice: string;
  tanggal_jatuh_tempo: string;
  pangkalan: { nama: string; kode: string; alamat?: string } | null;
  items: InvoiceItem[];
  subtotal: number;
  penyesuaian: number;
  kode_unik: number;
  total: number;
}

export function ExportPDFButton({ invoice }: { invoice: InvoicePDFData }) {
  const handleExport = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const p = invoice.pangkalan;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.nomor_invoice, 14, 26);

    // Company info right side
    doc.setFontSize(8);
    doc.text('PT Firman Putra Inti', 200, 20, { align: 'right' });
    doc.text('Gas LPG Distribution', 200, 25, { align: 'right' });

    // Invoice details
    let y = 38;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Kepada:', 14, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.text(p?.nama || '-', 14, y);
    y += 5;
    doc.text(p?.kode || '', 14, y);
    if (p?.alamat) { y += 5; doc.text(p.alamat, 14, y); }

    // Date info
    y = 38;
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal Invoice:', 120, y);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.tanggal_invoice, 160, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Jatuh Tempo:', 120, y);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.tanggal_jatuh_tempo || '-', 160, y);

    // Items table
    y += 12;
    autoTable(doc, {
      startY: y,
      head: [['Deskripsi', 'Qty', 'Harga', 'Subtotal']],
      body: invoice.items.map(i => [
        i.deskripsi,
        String(i.qty),
        `Rp ${i.unit_price.toLocaleString('id-ID')}`,
        `Rp ${i.line_total.toLocaleString('id-ID')}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    });

    // Totals
    y = (doc as any).lastAutoTable.finalY + 8;
    const rightX = 196;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, y); doc.text(`Rp ${invoice.subtotal.toLocaleString('id-ID')}`, rightX, y, { align: 'right' });
    if (invoice.penyesuaian !== 0) {
      y += 6;
      doc.text('Penyesuaian:', 140, y); doc.text(`${invoice.penyesuaian > 0 ? '+' : ''}Rp ${invoice.penyesuaian.toLocaleString('id-ID')}`, rightX, y, { align: 'right' });
    }
    if (invoice.kode_unik > 0) {
      y += 6;
      doc.text('Kode Unik:', 140, y); doc.text(`Rp ${invoice.kode_unik.toLocaleString('id-ID')}`, rightX, y, { align: 'right' });
    }
    y += 8;
    doc.setDrawColor(0);
    doc.line(140, y - 4, rightX, y - 4);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, y); doc.text(`Rp ${invoice.total.toLocaleString('id-ID')}`, rightX, y, { align: 'right' });

    // Footer
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Terima kasih atas kerjasama Anda.', 14, y);

    doc.save(`${invoice.nomor_invoice}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted/50"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
      Export PDF
    </button>
  );
}