function GlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-10 left-1/3 h-40 w-40 rounded-full bg-[#C57A12]/30 blur-3xl" />
      <div className="absolute top-16 right-16 h-28 w-28 rounded-full bg-[#E3A63B]/25 blur-2xl" />
      <div className="absolute bottom-12 left-8 h-36 w-36 rounded-full bg-[#A85E08]/30 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-[#E8A020]/25 blur-2xl" />
    </div>
  );
}

export default function GraphicTextCard({ text, fontSize = 140 }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative flex h-[481px] w-full max-w-[677px] items-center justify-center overflow-hidden bg-[#0D0806]">
        <GlowBackground />
        <div className="relative z-10 flex items-center justify-center">
          <span
            className="text-center leading-none font-bold text-[#F1AF08] uppercase"
            style={{ fontSize: `${fontSize}px` }}
          >
            {text}
          </span>
        </div>
      </section>
    </div>
  );
}
