"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GmailConnectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = () => {
    setLoading(true);
    router.push("/api/gmail/auth");
  };

  return (
    <div className="pt-2">
      <p className="text-xs text-muted-foreground mb-3">
        Hubungkan Gmail untuk mendeteksi notifikasi pembayaran dari Bank Mandiri secara otomatis.
      </p>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
      >
        {loading ? "Mengalihkan..." : "Hubungkan Gmail"}
      </button>
    </div>
  );
}
