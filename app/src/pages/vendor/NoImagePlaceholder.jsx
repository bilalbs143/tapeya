export function NoImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-[#2A2A28] px-1 text-[#ECECEC]" aria-hidden>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-center text-[8px] leading-none font-semibold tracking-wide uppercase">No Image</span>
    </div>
  );
}
