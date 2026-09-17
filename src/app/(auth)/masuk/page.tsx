import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">FPI-GMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masuk ke sistem manajemen
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
