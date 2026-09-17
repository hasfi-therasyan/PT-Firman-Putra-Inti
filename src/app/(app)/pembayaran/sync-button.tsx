"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

async function runSync() {
  const ingestRes = await fetch("/api/cron/gmail-ingest");
  const ingestData = await ingestRes.json();
  const reconcileRes = await fetch("/api/cron/reconcile");
  const reconcileData = await reconcileRes.json();
  return {
    ok: ingestRes.ok && reconcileRes.ok,
    ingested: ingestData.ingested ?? 0,
    matched: reconcileData.matched ?? 0,
    error: ingestData.error || reconcileData.error,
  };
}

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const router = useRouter();
  const autoSynced = useRef(false);

  // Auto-sync on page load (silent, no alert)
  useEffect(() => {
    if (autoSynced.current) return;
    autoSynced.current = true;

    (async () => {
      try {
        const result = await runSync();
        if (result.ok && (result.ingested > 0 || result.matched > 0)) {
          router.refresh();
        }
        setLastSync(new Date().toLocaleTimeString("id-ID"));
      } catch {
        // Silently fail on auto-sync
      }
    })();

    // Poll every 60 seconds
    const interval = setInterval(async () => {
      try {
        const result = await runSync();
        if (result.ok && (result.ingested > 0 || result.matched > 0)) {
          router.refresh();
        }
        setLastSync(new Date().toLocaleTimeString("id-ID"));
      } catch {
        // Silently fail
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  // Manual sync with feedback
  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await runSync();
      router.refresh();
      setLastSync(new Date().toLocaleTimeString("id-ID"));

      if (result.ok) {
        if (result.ingested === 0 && result.matched === 0) {
          // No new data — silent, no alert
        } else {
          alert(
            `Sinkronisasi selesai!\n` +
            `Email baru: ${result.ingested}\n` +
            `Tercocok: ${result.matched}`
          );
        }
      } else {
        alert("Gagal: " + result.error);
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {lastSync && (
        <span className="text-xs text-muted-foreground">Sync: {lastSync}</span>
      )}
      <Button onClick={handleSync} disabled={loading} variant="outline" size="sm">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
            Sync...
          </span>
        ) : "Sinkronisasi"}
      </Button>
    </div>
  );
}
