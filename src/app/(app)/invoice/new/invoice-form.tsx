'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils/format';
import { getActivePangkalan, getSchedulesForPangkalan } from '../actions';

const LPG_PRODUCTS = [
  { id: '3kg', nama: 'Gas LPG 3kg', harga: 15000 },
  { id: '5kg', nama: 'Gas LPG 5kg', harga: 70000 },
  { id: '12kg', nama: 'Gas LPG 12kg', harga: 120000 },
];

type InvoiceItem = { produkId: string; nama: string; qty: number; harga: number; subtotal: number };

export function InvoiceForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pangkalanId, setPangkalanId] = useState(() => searchParams.get('pangkalan') ?? '');
  const [pangkalanList, setPangkalanList] = useState<Array<{id: string; nama: string; kode: string}>>([]);
  const [scheduleId, setScheduleId] = useState(() => searchParams.get('schedule') ?? '');
  const [scheduleList, setScheduleList] = useState<Array<{id: string; tanggal_rencana: string; jumlah_tabung: number; status: string}>>([]);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [penyesuaian, setPenyesuaian] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getActivePangkalan().then(d => setPangkalanList(d || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (pangkalanId) getSchedulesForPangkalan(pangkalanId).then(d => setScheduleList(d || [])).catch(() => setScheduleList([]));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing list when dependency changes is safe
    else setScheduleList([]);
  }, [pangkalanId]);

  const handleItemChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    const product = LPG_PRODUCTS.find(p => p.id === productId)!;
    setItems(prev => {
      const rest = prev.filter(i => i.produkId !== productId);
      if (qty > 0) rest.push({ produkId: productId, nama: product.nama, qty, harga: product.harga, subtotal: qty * product.harga });
      return rest;
    });
  };

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const adj = parseInt(penyesuaian) || 0;
  const total = subtotal + adj;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pangkalanId) { setError('Pilih pangkalan'); return; }
    if (items.length === 0) { setError('Tambahkan minimal 1 item'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pangkalan_id: pangkalanId,
          delivery_schedule_id: scheduleId || null,
          tanggal_invoice: new Date().toISOString().split('T')[0],
          tanggal_jatuh_tempo: tanggalJatuhTempo,
          penyesuaian: adj,
          items: items.map(i => ({ deskripsi: i.nama, qty: i.qty, unit_price: i.harga })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      router.push(`/invoice/${data.invoiceId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Buat Invoice</h1>

      <div className="space-y-1">
        <label className="text-sm font-medium">Pangkalan *</label>
        <select value={pangkalanId} onChange={e => setPangkalanId(e.target.value)} required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm">
          <option value="">Pilih pangkalan...</option>
          {pangkalanList.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.kode})</option>)}
        </select>
      </div>

      {scheduleList.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Jadwal Pengiriman</label>
          <select value={scheduleId} onChange={e => setScheduleId(e.target.value)} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm">
            <option value="">Tanpa jadwal</option>
            {scheduleList.map(s => <option key={s.id} value={s.id}>{s.tanggal_rencana} - {s.jumlah_tabung} tabung</option>)}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Jatuh Tempo *</label>
        <input type="date" value={tanggalJatuhTempo} onChange={e => setTanggalJatuhTempo(e.target.value)} required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Item Invoice</label>
        <div className="rounded-lg border p-4 space-y-3">
          {LPG_PRODUCTS.map(product => (
            <div key={product.id} className="grid grid-cols-[1fr_80px_100px] gap-3 items-center">
              <div><span className="font-medium text-sm">{product.nama}</span><span className="text-xs text-muted-foreground ml-2">@ {formatRupiah(product.harga)}</span></div>
              <input type="number" min="0" placeholder="Qty" value={items.find(i => i.produkId === product.id)?.qty || ''} onChange={e => handleItemChange(product.id, e.target.value)} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
              <div className="text-right font-mono tabular-nums text-sm">{items.find(i => i.produkId === product.id)?.subtotal ? formatRupiah(items.find(i => i.produkId === product.id)!.subtotal) : '-'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Penyesuaian</label>
        <input type="number" value={penyesuaian} onChange={e => setPenyesuaian(e.target.value)} placeholder="-50000 atau 25000" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2 font-mono tabular-nums">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
        {adj !== 0 && <div className="flex justify-between"><span>Penyesuaian</span><span>{adj > 0 ? '+' : ''}{formatRupiah(adj)}</span></div>}
        <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatRupiah(total)}</span></div>
        <p className="text-xs text-muted-foreground">* Kode unik ditambahkan otomatis</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50">{loading ? 'Membuat...' : 'Buat Invoice'}</button>
        <button type="button" onClick={() => router.back()} className="flex-1 h-9 rounded-lg border text-sm font-medium hover:bg-muted">Batal</button>
      </div>
    </form>
  );
}
