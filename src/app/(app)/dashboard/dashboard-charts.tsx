'use client';

import { useState, useTransition } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { formatRupiah } from '@/lib/utils/format';
import { getDashboardData } from './actions';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/* Tabung LPG selalu memakai tiga hue kategoris yang sama di semua grafik:
   3kg = violet-blue, 5kg = tangerine, 12kg = cyan. */
const TABUNG_COLORS = { '3kg': 'var(--chart-2)', '5kg': 'var(--chart-1)', '12kg': 'var(--chart-3)' };

function KPICard({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: string; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {accent ? <span aria-hidden="true" className="mb-3 block h-1 w-12 rounded-full" style={{ backgroundColor: accent }} /> : null}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}

interface TooltipPayloadItem {
  value: number | string;
  name: string;
  color: string;
  payload?: any;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold tabular-nums" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatRupiah(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-lg">
      <p className="text-sm font-semibold" style={{ color: payload[0].color }}>
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

export function DashboardCharts({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pangkalanId, setPangkalanId] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pangkalan' | 'tabung'>('overview');

  const applyFilters = () => {
    startTransition(async () => {
      const result = await getDashboardData({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, pangkalan_id: pangkalanId || undefined });
      setData(result);
    });
  };

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setPangkalanId('');
    startTransition(async () => { setData(await getDashboardData()); });
  };

  const { summary, monthly, statusBreakdown, pangkalanRanking, scheduleStatus, tabungByPangkalan, recentPayments, overdueList } = data;

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex h-9 rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex h-9 rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Pangkalan</label>
            <select value={pangkalanId} onChange={(e) => setPangkalanId(e.target.value)} className="flex h-9 rounded-lg border bg-transparent px-3 text-sm">
              <option value="">Semua Pangkalan</option>
              {data.pangkalanList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
          <button onClick={applyFilters} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">Filter</button>
          <button onClick={clearFilters} className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/50">Reset</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Outstanding" value={formatRupiah(summary.totalOutstanding)} icon="💰" accent="var(--chart-4)" />
        <KPICard label="Jatuh Tempo" value={`${summary.overdueCount} invoice`} sub={summary.overdueTotal > 0 ? formatRupiah(summary.overdueTotal) : undefined} icon="⚠️" accent={summary.overdueCount > 0 ? 'var(--destructive)' : 'var(--chart-6)'} />
        <KPICard label="Total Ditagih" value={formatRupiah(summary.totalInvoiced)} sub={`${summary.invoiceCount} invoice`} icon="📄" accent="var(--chart-2)" />
        <KPICard label="Total Dibayar" value={formatRupiah(summary.totalPaid)} icon="✅" accent="var(--chart-5)" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Tabung Dikirim" value={String(summary.totalTabung)} icon="📦" accent="var(--chart-6)" />
        <KPICard label="Tabung 3kg" value={String(summary.tabung3kg)} icon="🔵" accent="var(--chart-2)" />
        <KPICard label="Tabung 5kg" value={String(summary.tabung5kg)} icon="🟡" accent="var(--chart-1)" />
        <KPICard label="Tabung 12kg" value={String(summary.tabung12kg)} icon="🟣" accent="var(--chart-3)" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted p-1 w-fit">
        {([['overview', 'Overview'], ['pangkalan', 'Pangkalan'], ['tabung', 'Tabung LPG']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === key ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Tagihan vs Pembayaran Bulanan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="invoiced" name="Ditagih" fill="var(--chart-6)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Dibayar" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Status Invoice</h3>
            {statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Status Pengiriman</h3>
            {scheduleStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={scheduleStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                    {scheduleStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-destructive">⚠ Invoice Jatuh Tempo</h3>
            {overdueList.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {overdueList.map((inv: { id: string; nomor_invoice: string; total: number; total_dibayar: number; pangkalan?: { nama: string } | null }) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div><p className="text-sm font-medium">{inv.nomor_invoice}</p><p className="text-xs text-muted-foreground">{inv.pangkalan?.nama}</p></div>
                    <p className="text-sm font-semibold tabular-nums text-destructive">{formatRupiah((inv.total || 0) - (inv.total_dibayar || 0))}</p>
                  </div>
                ))}
              </div>
            ) : <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Tidak ada invoice jatuh tempo 🎉</div>}
          </div>
        </div>
      )}

      {activeTab === 'pangkalan' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Top Pangkalan by Tagihan</h3>
            {pangkalanRanking.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pangkalanRanking} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} />
                  <YAxis type="category" dataKey="nama" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar dataKey="totalInvoiced" name="Ditagih" fill="var(--chart-6)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="totalPaid" name="Dibayar" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Ranking Pangkalan</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pangkalanRanking.map((p, i) => {
                const pct = p.totalInvoiced > 0 ? (p.totalPaid / p.totalInvoiced) * 100 : 0;
                return (
                  <div key={p.nama} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium"><span className="text-muted-foreground mr-2">#{i + 1}</span>{p.nama}</span>
                      <span className="font-semibold tabular-nums">{formatRupiah(p.totalInvoiced)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 rounded-full bg-muted h-2"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs text-muted-foreground tabular-nums">{pct.toFixed(1)}% terkumpul</span>
                    </div>
                    <p className="mt-1 text-xs text-success">Dibayar: {formatRupiah(p.totalPaid)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tabung' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Distribusi Tabung LPG per Pangkalan</h3>
            {tabungByPangkalan.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tabungByPangkalan} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="3kg" fill={TABUNG_COLORS['3kg']} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="5kg" fill={TABUNG_COLORS['5kg']} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="12kg" fill={TABUNG_COLORS['12kg']} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Total Tabung per Pangkalan</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tabungByPangkalan.map((p) => {
                const total = p['3kg'] + p['5kg'] + p['12kg'];
                return (
                  <div key={p.name} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm font-medium"><span>{p.name}</span><span>{total} tabung</span></div>
                    <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-muted">
                      {p['3kg'] > 0 && <div style={{ width: `${(p['3kg'] / total) * 100}%`, backgroundColor: TABUNG_COLORS['3kg'] }} />}
                      {p['5kg'] > 0 && <div style={{ width: `${(p['5kg'] / total) * 100}%`, backgroundColor: TABUNG_COLORS['5kg'] }} />}
                      {p['12kg'] > 0 && <div style={{ width: `${(p['12kg'] / total) * 100}%`, backgroundColor: TABUNG_COLORS['12kg'] }} />}
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      {p['3kg'] > 0 && <span>3kg: {p['3kg']}</span>}
                      {p['5kg'] > 0 && <span>5kg: {p['5kg']}</span>}
                      {p['12kg'] > 0 && <span>12kg: {p['12kg']}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Pembayaran Terbaru</h3>
        {recentPayments.length > 0 ? (
          <div className="space-y-2">
            {recentPayments.map((p: { id: string; nominal: number; nama_pengirim?: string | null; tanggal_transaksi?: string | null; created_at: string }) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{p.nama_pengirim || 'Transfer masuk'}</p>
                  <p className="text-xs text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-success">+{formatRupiah(p.nominal)}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Tidak ada pembayaran di periode ini.</p>}
      </div>
    </div>
  );
}