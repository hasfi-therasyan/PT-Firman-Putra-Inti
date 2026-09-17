"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateCompanyProfile,
  updateInvoiceSettings,
  addCompanyAccount,
  deleteCompanyAccount,
} from "./actions";

interface Settings {
  company_name: string;
  company_address: string | null;
  company_npwp: string | null;
  invoice_number_format: string;
  default_payment_terms_days: number;
  kode_unik_enabled: boolean;
  reconciliation_tolerance: number;
}

interface Account {
  id: string;
  nama_rekening: string;
  bank: string;
  nomor_rekening_masked: string;
  is_active: boolean;
}

export function SettingsForms({
  settings,
  accounts,
}: {
  settings: Settings | null;
  accounts: Account[];
}) {
  return (
    <div className="space-y-8">
      <CompanyProfileSection settings={settings} />
      <InvoiceSettingsSection settings={settings} />
      <AccountsSection accounts={accounts} />
    </div>
  );
}

function CompanyProfileSection({
  settings,
}: {
  settings: Settings | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    try {
      await updateCompanyProfile({
        company_name: fd.get("company_name") as string,
        company_address:
          (fd.get("company_address") as string) || undefined,
        company_npwp:
          (fd.get("company_npwp") as string) || undefined,
      });
      setSaved(true);
      router.refresh();
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Profil Perusahaan</h2>
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-card p-4 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Nama Perusahaan
          </label>
          <input
            name="company_name"
            defaultValue={settings?.company_name || ""}
            className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Alamat</label>
          <textarea
            name="company_address"
            defaultValue={settings?.company_address || ""}
            rows={2}
            className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">NPWP</label>
          <input
            name="company_npwp"
            defaultValue={settings?.company_npwp || ""}
            className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {saved && (
            <span className="text-sm text-success">Tersimpan</span>
          )}
        </div>
      </form>
    </section>
  );
}


function InvoiceSettingsSection({
  settings,
}: {
  settings: Settings | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    try {
      await updateInvoiceSettings({
        invoice_number_format: fd.get("invoice_number_format") as string,
        default_payment_terms_days: Number(fd.get("default_payment_terms_days")),
        kode_unik_enabled: fd.get("kode_unik_enabled") === "on",
        reconciliation_tolerance: Number(fd.get("reconciliation_tolerance")),
      });
      setSaved(true);
      router.refresh();
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Invoice</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Format Nomor</label>
            <input name="invoice_number_format" defaultValue={settings?.invoice_number_format || "INV/YYYY/MM/NNNN"} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tempo (hari)</label>
            <input name="default_payment_terms_days" type="number" defaultValue={settings?.default_payment_terms_days ?? 30} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Toleransi Rekonsiliasi (Rp)</label>
            <input name="reconciliation_tolerance" type="number" defaultValue={settings?.reconciliation_tolerance ?? 500} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Kode Unik</label>
            <label className="flex items-center gap-2 h-9">
              <input type="checkbox" name="kode_unik_enabled" defaultChecked={settings?.kode_unik_enabled ?? true} className="size-4" />
              <span className="text-sm">Aktif</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {saved && <span className="text-sm text-success">Tersimpan</span>}
        </div>
      </form>
    </section>
  );
}

function AccountsSection({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addCompanyAccount({
        nama_rekening: fd.get("nama_rekening") as string,
        bank: fd.get("bank") as string,
        nomor_rekening_masked: fd.get("nomor_rekening_masked") as string,
      });
      setShowAdd(false);
      router.refresh();
    } catch {
      alert("Gagal menambah");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus rekening ini?")) return;
    try {
      await deleteCompanyAccount(id);
      router.refresh();
    } catch {
      alert("Gagal hapus");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rekening Perusahaan</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
        >
          {showAdd ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Rekening</label>
              <input name="nama_rekening" required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bank</label>
              <input name="bank" required defaultValue="Mandiri" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">No. Rekening (masked)</label>
              <input name="nomor_rekening_masked" required placeholder="***1234" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50">
            {loading ? "Menambah..." : "Tambah Rekening"}
          </button>
        </form>
      )}

      {!accounts || accounts.length === 0 ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Belum ada rekening terdaftar.
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{a.nama_rekening}</p>
                <p className="text-xs text-muted-foreground">
                  {a.bank} · {a.nomor_rekening_masked}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${a.is_active ? "text-success" : "text-muted-foreground"}`}>
                  {a.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <button onClick={() => handleDelete(a.id)} className="text-xs text-destructive hover:underline">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
