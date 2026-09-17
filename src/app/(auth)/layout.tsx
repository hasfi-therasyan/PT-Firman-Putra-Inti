export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-12"
      style={{
        background:
          "radial-gradient(900px 420px at 50% -8%, rgba(248,145,37,0.16), transparent 62%), linear-gradient(180deg, oklch(0.955 0.01 250) 0%, oklch(0.992 0.003 250) 45%, oklch(0.962 0.008 250) 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center overflow-hidden rounded-xl shadow-md"
            style={{
              background: "linear-gradient(135deg, #2f5c96 0%, #134376 55%, #0b1119 100%)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <rect x="30" y="6" width="4" height="8" rx="1" fill="#f6fbff" />
              <rect x="19" y="13" width="26" height="38" rx="6" fill="#f6fbff" />
              <rect x="17" y="47" width="30" height="6" rx="3" fill="#cfdfef" />
              <path
                d="M32 18c5.5 7.5 9 11.8 9 16.4A9 9 0 0 1 23 34.4C23 29.8 26.5 25.5 32 18Z"
                fill="#f89125"
              />
              <path
                d="M32 26.5c2.6 3.6 4.2 5.6 4.2 8A4.2 4.2 0 0 1 27.8 34.5c0-2.4 1.6-4.4 4.2-8Z"
                fill="#fffaf0"
              />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-[0.16em]">FPI-GMS</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              PT Firman Putra Inti
            </span>
          </span>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
