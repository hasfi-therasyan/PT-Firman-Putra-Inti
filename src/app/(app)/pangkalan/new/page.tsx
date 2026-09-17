import type { Metadata } from "next";
import { PangkalanForm } from "./pangkalan-form";

export const metadata: Metadata = {
  title: "Pangkalan Baru",
};

export default function NewPangkalanPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Pangkalan Baru</h1>
      <PangkalanForm />
    </div>
  );
}
