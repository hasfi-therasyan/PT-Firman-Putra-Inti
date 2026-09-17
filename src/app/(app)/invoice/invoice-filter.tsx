"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "issued", label: "Diterbitkan" },
  { value: "partial", label: "Sebagian" },
  { value: "paid", label: "Lunas" },
  { value: "overdue", label: "Jatuh Tempo" },
  { value: "cancelled", label: "Dibatalkan" },
];

interface Props {
  currentStatus: string;
  currentSearch: string;
}

export function InvoiceFilterBar({ currentStatus, currentSearch }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [search, setSearch] = useState(currentSearch);

  const apply = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    router.push(`/invoice?${params.toString()}`);
  };

  const clear = () => {
    setStatus("");
    setSearch("");
    router.push("/invoice");
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Cari</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomor invoice atau nama pangkalan..."
            className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          />
        </div>
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
        <button onClick={apply} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
        {(status || search) && (
          <button onClick={clear} className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}