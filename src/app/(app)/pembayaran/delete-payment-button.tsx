"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePaymentTransaction } from "./actions";

export function DeletePaymentButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Hapus transaksi ini? Email tidak akan disinkron ulang.")) return;
    setLoading(true);
    try {
      await deletePaymentTransaction(id);
      router.refresh();
    } catch {
      alert("Gagal menghapus transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus transaksi"
      className="mt-0.5 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  );
}
