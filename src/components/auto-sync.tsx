"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Background auto-sync: fetches new emails and runs reconcile silently.
 * Used on dashboard and pembayaran pages.
 * In production, Vercel Cron handles this — this is for local dev.
 */
export function AutoSync() {
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const run = async () => {
      try {
        const ingestRes = await fetch("/api/cron/gmail-ingest");
        const reconcileRes = await fetch("/api/cron/reconcile");
        if (ingestRes.ok && reconcileRes.ok) {
          const ingest = await ingestRes.json();
          const reconcile = await reconcileRes.json();
          if ((ingest.ingested ?? 0) > 0 || (reconcile.matched ?? 0) > 0) {
            router.refresh();
          }
        }
      } catch {
        // Silent fail
      }
    };

    // Run once on mount, then every 90s
    run();
    const interval = setInterval(run, 90000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}