"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPangkalan, type PangkalanInput } from "../actions";

export function PangkalanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data: PangkalanInput = {
      nama: fd.get("nama") as string,
      kode: fd.get("kode") as string,
      alamat: (fd.get("alamat") as string) || undefined,
      kecamatan: (fd.get("kecamatan") as string) || undefined,
      kota: (fd.get("kota") as string) || undefined,
      telepon: (fd.get("telepon") as string) || undefined,
      pic_nama: (fd.get("pic_nama") as string) || undefined,
      kuota_tabung_bulanan: fd.get("kuota_tabung_bulanan")
        ? Number(fd.get("kuota_tabung_bulanan"))
        : undefined,
      tabung_3kg: fd.get("tabung_3kg") ? Number(fd.get("tabung_3kg")) : 0,
      tabung_5kg: fd.get("tabung_5kg") ? Number(fd.get("tabung_5kg")) : 0,
      tabung_12kg: fd.get("tabung_12kg") ? Number(fd.get("tabung_12kg")) : 0,
      status: (fd.get("status") as "aktif" | "nonaktif") || "aktif",
      catatan: (fd.get("catatan") as string) || undefined,
    };

    try {
      await createPangkalan(data);
      router.push("/pangkalan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="nama" className="text-sm font-medium">Nama *</label>
          <input id="nama" name="nama" required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="kode" className="text-sm font-medium">Kode *</label>
          <input id="kode" name="kode" required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="alamat" className="text-sm font-medium">Alamat</label>
        <input id="alamat" name="alamat" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="kecamatan" className="text-sm font-medium">Kecamatan</label>
          <input id="kecamatan" name="kecamatan" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="kota" className="text-sm font-medium">Kota</label>
          <input id="kota" name="kota" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="telepon" className="text-sm font-medium">Telepon</label>
          <input id="telepon" name="telepon" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="pic_nama" className="text-sm font-medium">PIC</label>
          <input id="pic_nama" name="pic_nama" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="kuota_tabung_bulanan" className="text-sm font-medium">Kuota Tabung/Bulan</label>
          <input id="kuota_tabung_bulanan" name="kuota_tabung_bulanan" type="number" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select id="status" name="status" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm">
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Jumlah Tabung LPG</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="tabung_3kg" className="text-sm font-medium">LPG 3kg</label>
          <input id="tabung_3kg" name="tabung_3kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="tabung_5kg" className="text-sm font-medium">LPG 5kg</label>
          <input id="tabung_5kg" name="tabung_5kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="tabung_12kg" className="text-sm font-medium">LPG 12kg</label>
          <input id="tabung_12kg" name="tabung_12kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="catatan" className="text-sm font-medium">Catatan</label>
        <textarea id="catatan" name="catatan" rows={3} className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
