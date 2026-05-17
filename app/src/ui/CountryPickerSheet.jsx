import { useEffect, useMemo, useRef, useState } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { getFlagEmoji } from '@/lib/phoneCodes';
import { COUNTRIES } from '@/lib/phoneMetadata';
import { DialogOverlay } from '@/ui/Dialog';

const SHEET =
  'fixed bottom-0 left-0 right-0 z-50 flex h-[85vh] flex-col overflow-hidden rounded-t-[17px] border-t-2 p-0 shadow-xl outline-none ' +
  'md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:h-[80vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[17px] md:border-2';

const SEARCH_INPUT =
  'w-full rounded-[8px] bg-[#1C1C1A] px-4 py-3 text-[14px] text-white placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50';

const ROW_BASE = 'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors active:bg-white/5';

const ROW_ACTIVE = 'bg-white/5';

export function CountryPickerSheet({ open, onClose, currentDialCode, onSelect }) {
  const [search, setSearch] = useState('');
  const activeRowRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      const id = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (open && !search) {
      activeRowRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [open, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const dialQ = q.replace(/\D/g, '');
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || (dialQ && c.dialCode.startsWith(dialQ)));
  }, [search]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogOverlay />

        <DialogPrimitive.Content
          className={SHEET}
          style={{ backgroundColor: '#080807', borderColor: '#141412' }}
          aria-describedby={undefined}
          aria-label="Select country"
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
            <DialogPrimitive.Title className="text-[14px] font-bold tracking-wide text-[#DA9811] uppercase">
              Select Country
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-md text-[#A2A6AB] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703]"
              aria-label="Close"
            >
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </DialogPrimitive.Close>
          </div>

          <div className="shrink-0 px-4 pt-3 pb-2">
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Search country or dial code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={SEARCH_INPUT}
              aria-label="Search countries"
            />
          </div>

          <div
            className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="listbox"
            aria-label="Countries"
          >
            {filtered.length === 0 && (
              <p className="px-5 py-6 text-center text-[13px] text-[#A2A6AB]">No countries found for &quot;{search}&quot;</p>
            )}

            {filtered.map((country) => {
              const isActive = country.dialCode === currentDialCode;
              return (
                <button
                  key={`${country.iso}-${country.dialCode}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  ref={isActive ? activeRowRef : null}
                  onClick={() => {
                    onSelect(country.dialCode);
                    onClose();
                  }}
                  className={`${ROW_BASE} ${isActive ? ROW_ACTIVE : 'hover:bg-white/[0.03]'}`}
                >
                  <span className="text-2xl leading-none" aria-hidden>
                    {getFlagEmoji(country.iso)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-white">{country.name}</span>
                  <span className="shrink-0 text-[13px] text-[#A2A6AB]">+{country.dialCode}</span>
                  {isActive && (
                    <span className="shrink-0 text-[#DA9811]" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default CountryPickerSheet;
