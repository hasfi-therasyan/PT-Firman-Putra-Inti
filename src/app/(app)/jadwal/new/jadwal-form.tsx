"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJadwal, getActivePangkalan, type JadwalInput } from "../actions";

interface Pangkalan {
  id: string;
  nama: string;
  kode: string;
}

export function JadwalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pangkalanList, setPangkalanList] = useState<Pangkalan[]>([]);
  const [selectedPangkalan, setSelectedPangkalan] = useState("");

  useEffect(() => {
    getActivePangkalan()
      .then((d) => setPangkalanList(d || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data: JadwalInput = {
      pangkalan_id: fd.get("pangkalan_id") as string,
      tanggal_rencana: fd.get("tanggal_rencana") as string,
      jumlah_tabung: Number(fd.get("jumlah_tabung")),
      tabung_3kg: fd.get("tabung_3kg") ? Number(fd.get("tabung_3kg")) : 0,
      tabung_5kg: fd.get("tabung_5kg") ? Number(fd.get("tabung_5kg")) : 0,
      tabung_12kg: fd.get("tabung_12kg") ? Number(fd.get("tabung_12kg")) : 0,
      nomor_kendaraan: (fd.get("nomor_kendaraan") as string) || undefined,
      sopir: (fd.get("sopir") as string) || undefined,
      catatan: (fd.get("catatan") as string) || undefined,
    };

    try {
      await createJadwal(data);
      router.push("/jadwal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="pangkalan_id" className="text-sm font-medium">Pangkalan *</label>
        <select
          id="pangkalan_id"
          name="pangkalan_id"
          required
          value={selectedPangkalan}
          onChange={(e) => setSelectedPangkalan(e.target.value)}
          className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
        >
          <option value="">Pilih pangkalan...</option>
          {pangkalanList.map((p) => (
            <option key={p.id} value={p.id}>{p.nama} ({p.kode})</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="tanggal_rencana" className="text-sm font-medium">Tanggal Rencana *</label>
          <input id="tanggal_rencana" name="tanggal_rencana" type="date" required className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="jumlah_tabung" className="text-sm font-medium">Jumlah Tabung *</label>
          <input id="jumlah_tabung" name="jumlah_tabung" type="number" required min="1" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rincian Tabung LPG</label>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="tabung_3kg" className="text-xs text-muted-foreground">LPG 3kg</label>
            <input id="tabung_3kg" name="tabung_3kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="tabung_5kg" className="text-xs text-muted-foreground">LPG 5kg</label>
            <input id="tabung_5kg" name="tabung_5kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="tabung_12kg" className="text-xs text-muted-foreground">LPG 12kg</label>
            <input id="tabung_12kg" name="tabung_12kg" type="number" min="0" defaultValue={0} className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="nomor_kendaraan" className="text-sm font-medium">Nomor Kendaraan</label>
          <input id="nomor_kendaraan" name="nomor_kendaraan" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="sopir" className="text-sm font-medium">Sopir</label>
          <input id="sopir" name="sopir" className="flex h-9 w-full rounded-lg border bg-transparent px-3 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="catatan" className="text-sm font-medium">Catatan</label>
        <textarea id="catatan" name="catatan" rows={2} className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={loading} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50">
        {loading ? "Menyimpan..." : "Simpan Jadwal"}
      </button>
    </form>
  );
}