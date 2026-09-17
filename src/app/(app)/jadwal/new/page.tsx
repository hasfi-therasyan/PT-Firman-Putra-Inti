import { JadwalForm } from './jadwal-form';

export default function NewJadwalPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Buat Jadwal Pengiriman</h1>
      <JadwalForm />
    </div>
  );
}