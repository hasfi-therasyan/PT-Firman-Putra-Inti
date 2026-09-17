"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "matched", label: "Tercocok" },
  { value: "unmatched", label: "Belum Cocok" },
  { value: "partially_allocated", label: "Sebagian" },
];

const ARAH_OPTIONS = [
  { value: "", label: "Semua Arah" },
  { value: "masuk", label: "Masuk" },
  { value: "keluar", label: "Keluar" },
];

interface Props {
  currentStatus: string;
  currentArah: string;
  currentDateFrom: string;
  currentDateTo: string;
}

export function PembayaranFilterBar({ currentStatus, currentArah, currentDateFrom, currentDateTo }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [arah, setArah] = useState(currentArah);
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);

  const apply = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (arah) params.set("arah", arah);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    router.push(`/pembayaran?${params.toString()}`);
  };

  const clear = () => {
    setStatus("");
    setArah("");
    setDateFrom("");
    setDateTo("");
    router.push("/pembayaran");
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-9 rounded-lg border bg-transparent px-3 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Arah</label>
          <select
            value={arah}
            onChange={(e) => setArah(e.target.value)}
            className="flex h-9 rounded-lg border bg-transparent px-3 text-sm"
          >
            {ARAH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Dari</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex h-9 rounded-lg border bg-transparent px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sampai</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex h-9 rounded-lg border bg-transparent px-3 text-sm"
          />
        </div>
        <button onClick={apply} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
        {(status || arah || dateFrom || dateTo) && (
          <button onClick={clear} className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}