import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';

export default function Login() {
  return (
    <>
      <div
        className="pointer-events-none fixed left-1/2 top-[-115px] z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-50 blur-[200px]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-full flex-col items-center pt-12">
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="h-auto w-[270px] opacity-0 motion-safe:animate-splash-slide-up motion-reduce:opacity-100"
        />
        <p
          className="mt-6 max-w-[90vw] text-center text-[16px] text-white opacity-0 motion-safe:animate-splash-slide-up-delayed motion-reduce:opacity-100"
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          Live Cricket & Instant Updates, Anytime!
        </p>
      </div>
    </>
  );
}
