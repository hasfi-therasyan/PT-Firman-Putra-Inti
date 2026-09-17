import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GmailConnectButton } from "./gmail-connect";
import { SettingsForms } from "./settings-forms";
import { InstallPWAButton } from "@/components/install-pwa";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default async function PengaturanPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .single();

  const { data: accounts } = await supabase
    .from("company_accounts")
    .select("*")
    .order("created_at");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <SettingsForms
        settings={settings as any}
        accounts={(accounts as any) || []}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Koneksi Gmail</h2>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <InfoRow label="Status" value={settings?.last_gmail_synced_at ? "Tersinkronisasi" : "Belum terhubung"} />
          {settings?.last_gmail_synced_at && (
            <InfoRow label="Sync Terakhir" value={new Date(settings.last_gmail_synced_at).toLocaleString("id-ID")} />
          )}
          <GmailConnectButton />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Aplikasi</h2>
        <div className="rounded-lg border bg-card p-4">
          <InstallPWAButton className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors" />
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
