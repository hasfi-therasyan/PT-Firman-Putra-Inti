"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Brand colours for the splash are intentionally fixed (not theme-driven):
 * the opening moment is a native-style brand screen, so it always renders on
 * the deep petrol-navy backdrop regardless of light/dark preference.
 */
const SPLASH = {
  navyDeep: "#0b1119",
  petrol: "#134376",
  flame: "#e57600",
  flameSoft: "#f89125",
  vapor: "#7ec8c8",
  ink: "#f6fbff",
} as const;

/** How long the brand moment is held before it starts leaving. */
const HOLD_MS = 2000;
/** Keep in sync with the `.fpi-splash[data-leaving]` animation in globals.css. */
const LEAVE_MS = 520;

type Phase = "visible" | "leaving" | "gone";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("visible");
  const timers = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    setPhase((current) => (current === "visible" ? "leaving" : current));
  }, []);

  // Hold the brand moment, then fold it away.
  useEffect(() => {
    if (phase !== "visible") return;

    const hold = window.setTimeout(dismiss, HOLD_MS);
    timers.current.push(hold);

    return () => window.clearTimeout(hold);
  }, [phase, dismiss]);

  // Let the user skip it with a tap, click or key press.
  useEffect(() => {
    if (phase !== "visible") return;

    const onKey = (event: KeyboardEvent) => {
      event.preventDefault();
      dismiss();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", dismiss);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [phase, dismiss]);

  // Unmount once the exit animation has finished.
  useEffect(() => {
    if (phase !== "leaving") return;

    const leave = window.setTimeout(() => setPhase("gone"), LEAVE_MS);
    timers.current.push(leave);

    return () => window.clearTimeout(leave);
  }, [phase]);

  // Lock scroll behind the overlay.
  useEffect(() => {
    if (phase === "gone") return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  // Always clear pending timers on unmount.
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    },
    []
  );

  if (phase === "gone") return null;

  return (
    <div
      className="fpi-splash"
      data-leaving={phase === "leaving" ? "true" : "false"}
      data-testid="splash-screen"
      role="status"
      aria-live="polite"
      aria-label="Memuat FPI-GMS, sistem manajemen distribusi gas LPG"
    >
      <span
        className="fpi-orb"
        aria-hidden="true"
        style={{ top: "16%", left: "14%", width: 10, height: 10, background: SPLASH.flameSoft }}
      />
      <span
        className="fpi-orb"
        aria-hidden="true"
        style={{ bottom: "22%", right: "16%", width: 14, height: 14, background: SPLASH.vapor }}
      />
      {/* Emblem: tabung (inventory) + flame (energy) + vapor (gas) */}
      <div className="fpi-emblem" aria-hidden="true">
        <span className="fpi-emblem-halo" />
        <span className="fpi-emblem-ring" />
        <span className="fpi-emblem-ring" />
        <span className="fpi-emblem-ring" />

        <svg
          className="fpi-emblem-body"
          width="150"
          height="150"
          viewBox="0 0 120 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fpi-body" x1="39" y1="72" x2="81" y2="132" gradientUnits="userSpaceOnUse">
              <stop stopColor={SPLASH.ink} />
              <stop offset="1" stopColor="#b9d2ea" />
            </linearGradient>
            <linearGradient id="fpi-fire" x1="60" y1="2" x2="60" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffd08a" />
              <stop offset="0.55" stopColor={SPLASH.flameSoft} />
              <stop offset="1" stopColor={SPLASH.flame} />
            </linearGradient>
            <radialGradient id="fpi-glow" cx="0.5" cy="0.5" r="0.5">
              <stop stopColor={SPLASH.flameSoft} stopOpacity="0.85" />
              <stop offset="1" stopColor={SPLASH.flameSoft} stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="60" cy="26" rx="26" ry="24" fill="url(#fpi-glow)" opacity="0.55" />

          {/* flame */}
          <g className="fpi-flame">
            <path
              d="M60 2c8 10 14 16 14 25a14 14 0 0 1-28 0c0-9 6-15 14-25Z"
              fill="url(#fpi-fire)"
            />
            <path
              className="fpi-flame-inner"
              d="M60 16c4 5 6 8 6 12a6 6 0 0 1-12 0c0-4 2-7 6-12Z"
              fill="#fffaf0"
              opacity="0.92"
            />
          </g>

          {/* valve wheel + neck */}
          <circle cx="60" cy="49" r="6.5" stroke={SPLASH.ink} strokeWidth="3" />
          <rect x="57.5" y="55" width="5" height="7" rx="1.5" fill={SPLASH.ink} />

          {/* collar guard */}
          <path
            d="M45 62h30v4.5a5 5 0 0 1-5 5H50a5 5 0 0 1-5-5V62Z"
            fill={SPLASH.ink}
            opacity="0.9"
          />

          {/* cylinder body */}
          <path
            d="M39 78c0-5.5 4.5-9 21-9s21 3.5 21 9v36a11 11 0 0 1-11 11H50a11 11 0 0 1-11-11V78Z"
            fill="url(#fpi-body)"
          />
          <path
            d="M45 80c0-3.5 3-5.5 15-5.5V129H50a5 5 0 0 1-5-5V80Z"
            fill="#ffffff"
            opacity="0.45"
          />
          <rect x="47" y="96" width="26" height="4" rx="2" fill={SPLASH.petrol} opacity="0.85" />
          <rect x="34" y="121" width="52" height="8" rx="4" fill={SPLASH.ink} opacity="0.92" />

          {/* vapor particles rising off the valve */}
          <g fill={SPLASH.vapor}>
            <circle className="fpi-vapor" cx="34" cy="46" r="3" />
            <circle className="fpi-vapor" cx="86" cy="42" r="2.4" />
            <circle className="fpi-vapor" cx="27" cy="34" r="2" />
            <circle className="fpi-vapor" cx="93" cy="30" r="2.6" />
          </g>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="fpi-wordmark text-center">
        <p className="text-[1.6rem] font-bold leading-none tracking-[0.22em] text-white">
          FPI-GMS
        </p>
        <span className="brand-rule mx-auto mt-3 block h-[3px] w-14 rounded-full" />
      </div>

      <div className="fpi-tagline space-y-1.5 text-center">
        <p className="text-sm font-medium text-white/85">
          Sistem Manajemen Distribusi Gas LPG
        </p>
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/45">
          PT Firman Putra Inti
        </p>
      </div>

      {/* Distribution pipeline: stock flowing out to every pangkalan */}
      <svg
        className="fpi-collapsed-brand"
        width="248"
        height="30"
        viewBox="0 0 248 30"
        fill="none"
        aria-hidden="true"
      >
        <path className="fpi-pipeline-track" d="M10 15H238" strokeWidth="2" strokeLinecap="round" />
        <path className="fpi-pipeline-pulse" d="M10 15H238" strokeLinecap="round" />
        <path className="fpi-pipeline-flow" d="M10 15H238" strokeLinecap="round" />
        <circle cx="10" cy="15" r="5.5" fill={SPLASH.flameSoft} />
        <circle cx="10" cy="15" r="2.2" fill="#fffaf0" />
        <g fill={SPLASH.vapor}>
          <circle className="fpi-delivery" cx="67" cy="15" r="4" />
          <circle className="fpi-delivery" cx="124" cy="15" r="4" />
          <circle className="fpi-delivery" cx="181" cy="15" r="4" />
        </g>
        <circle className="fpi-delivery" cx="238" cy="15" r="5" fill={SPLASH.flameSoft} />
      </svg>

      {/* Progress */}
      <div className="fpi-stage space-y-3">
        <div className="fpi-progress mx-auto">
          <div className="fpi-progress-bar" />
          <div className="fpi-progress-sheen" />
        </div>
        <p className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-white/50">
          Menyiapkan data distribusi
        </p>
      </div>

    </div>
  );
}
