import { useEffect, useMemo, useRef, useState } from 'react';

import { COUNTRIES, getFlagEmoji } from '@/lib/phoneCodes';
import { BottomSheet } from '@/ui/BottomSheet';

const SEARCH_INPUT =
  'w-full rounded-[8px] bg-[#1C1C1A] px-4 py-3 text-[14px] text-white placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50';

const ROW_BASE = 'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors active:bg-white/5';

const ROW_ACTIVE = 'bg-white/5';

const LIST_BODY_CLASS = 'min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

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
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Select Country"
      ariaLabel="Select Country"
      bodyClassName={LIST_BODY_CLASS}
      toolbar={
        <input
          ref={searchRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Search country or dial code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={SEARCH_INPUT}
          aria-label="Search Countries"
        />
      }
    >
      <div role="listbox" aria-label="Countries">
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
              className={`${ROW_BASE} ${isActive ? ROW_ACTIVE : 'hover:bg-white/3'}`}
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
    </BottomSheet>
  );
}

export default CountryPickerSheet;
