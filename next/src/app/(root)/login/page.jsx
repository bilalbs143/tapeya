'use client';

import { Orbitron } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-orbitron',
  display: 'swap',
});

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const handlers = useMemo(
    () => ({
      toggle: () => setValue((prev) => !prev),
      setOn: () => setValue(true),
      setOff: () => setValue(false),
    }),
    [],
  );

  return [value, handlers.toggle, handlers.setOn, handlers.setOff];
}

export default function LoginPage() {
  const [showPassword, togglePassword] = useToggle(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#040016] via-[#080532] to-[#0e013a] px-4 py-12 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.25),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.22),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(295deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:220px_220px]" />
      </div>

      <section className="relative flex w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-[#8035ff]/60 bg-[#0a0126]/80 shadow-[0_0_60px_rgba(128,53,255,0.45)] backdrop-blur-xl">
        <div className="absolute top-6 right-6 z-20">
          <button
            aria-label="Close login"
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/5 text-white transition hover:bg-white/15 hover:text-[#c084fc]"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 transition group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 6L18 18M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="hidden w-[46%] min-w-[320px] flex-col justify-center bg-gradient-to-br from-[#3e0c8a] via-[#5b1adf] to-[#7a26ff] px-10 py-14 md:flex">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/30 bg-black/20 shadow-[0_0_50px_rgba(113,47,255,0.6)]">
            <span className="absolute inset-3 rounded-[1.6rem] border border-[#b48cff]/20" />
            <Image
              alt="Futuristic cyber panda"
              className="relative z-10 h-auto w-full max-w-[320px] object-contain"
              height={520}
              priority
              src="/images/login-futuristic-panda.png"
              width={420}
            />
            <div className="absolute top-10 -left-16 h-32 w-32 rounded-full bg-[#9f37ff]/40 blur-3xl" />
            <div className="absolute right-2 -bottom-16 h-36 w-36 rounded-full bg-[#ec4899]/30 blur-3xl" />
          </div>
        </div>

        <div className="relative z-10 flex w-full flex-col gap-10 px-8 py-12 md:w-[54%] md:px-16 md:py-14">
          <div className="flex flex-col gap-4">
            <span
              className={`${orbitron.className} text-sm tracking-[0.35em] text-[#a855f7]/80 uppercase`}
            >
              Welcome back
            </span>
            <h1
              className={`${orbitron.className} text-4xl tracking-[0.45em] text-white uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.45)]`}
            >
              Login
            </h1>
          </div>

          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <label
                htmlFor="email"
                className="text-xs tracking-[0.3em] text-white/60 uppercase"
              >
                Your Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center text-[#c084fc]">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
                    <path d="M4 7l8 6 8-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  aria-label="Email address"
                  autoComplete="email"
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white/5 px-14 text-sm tracking-[0.05em] text-white placeholder-white/40 shadow-[inset_0_0_15px_rgba(124,58,237,0.35)] transition outline-none focus:border-[#a855f7] focus:shadow-[0_0_15px_#8b5cf6] focus:ring-0"
                  placeholder="Your Email"
                  type="email"
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs tracking-[0.32em] text-white/40 uppercase">
                  Email
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <label
                htmlFor="password"
                className="text-xs tracking-[0.3em] text-white/60 uppercase"
              >
                Your Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center text-[#c084fc]">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <input
                  id="password"
                  aria-label="Password"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white/5 px-14 text-sm tracking-[0.05em] text-white placeholder-white/40 shadow-[inset_0_0_15px_rgba(236,72,153,0.35)] transition outline-none focus:border-[#a855f7] focus:shadow-[0_0_15px_#8b5cf6] focus:ring-0"
                  placeholder="Your Password"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/20 bg-black/20 text-white transition hover:border-[#a855f7] hover:text-[#c084fc]"
                  onClick={(event) => {
                    event.preventDefault();
                    togglePassword();
                  }}
                  type="button"
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a16.91 16.91 0 01-2.64 3.63M6.35 6.35A16.91 16.91 0 001 12s4 8 11 8a9.15 9.15 0 004.24-1" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      viewBox="0 0 24 24"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between text-xs tracking-[0.3em] text-white/70 uppercase">
                <label className="flex cursor-pointer items-center gap-3">
                  <span className="relative flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-white/5 shadow-[0_0_10px_rgba(167,139,250,0.45)] transition">
                    <input
                      className="peer h-full w-full cursor-pointer appearance-none"
                      type="checkbox"
                    />
                    <span className="pointer-events-none absolute inset-[2px] hidden rounded-[6px] bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] shadow-[0_0_12px_rgba(236,72,153,0.55)] peer-checked:block" />
                  </span>
                  <span className="select-none">Remember Me</span>
                </label>
                <Link
                  className="text-white/70 transition hover:text-[#c084fc]"
                  href="#"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#9f37ff] via-[#ec4899] to-[#7c3aed] text-sm font-semibold tracking-[0.4em] uppercase shadow-[0_0_25px_rgba(165,94,246,0.6)] transition hover:shadow-[0_0_30px_#8b5cf6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]"
                type="submit"
              >
                Login
                <span className="absolute inset-0 rounded-2xl border border-white/30 opacity-40" />
              </button>

              <button
                className="relative flex h-14 w-full items-center justify-center rounded-2xl border border-[#8b5cf6]/60 bg-transparent text-sm font-semibold tracking-[0.28em] text-white/80 uppercase transition hover:border-[#c084fc] hover:text-white"
                type="button"
              >
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8b5cf6]/15 via-transparent to-[#ec4899]/20 opacity-0 transition hover:opacity-100" />
                <span className="relative">
                  Don&apos;t Have an Account? Register
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
