"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "dijadwalkan", label: "Dijadwalkan" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

interface Props {
  currentStatus: string;
  currentDateFrom: string;
  currentDateTo: string;
}

export function JadwalFilterBar({ currentStatus, currentDateFrom, currentDateTo }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);

  const apply = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    router.push(`/jadwal?${params.toString()}`);
  };

  const clear = () => {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    router.push("/jadwal");
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
        {(status || dateFrom || dateTo) && (
          <button onClick={clear} className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}