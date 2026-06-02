import { forwardRef } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { CloseIcon } from '@/ui/icons/CloseIcon';

const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

/**
 * Shared search input with icon and inline clear button.
 *
 * @param {{
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onClear: () => void,
 *   placeholder?: string,
 *   id?: string,
 *   'aria-label'?: string,
 *   'aria-controls'?: string,
 * }} props
 */
export const SearchInput = forwardRef(function SearchInput(
  { value, onChange, onClear, placeholder = 'Search…', id, ...aria },
  ref,
) {
  return (
    <div className="relative [&_input::-webkit-search-cancel-button]:hidden [&_input::-webkit-search-decoration]:hidden">
      <input
        ref={ref}
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-[6px] bg-[#141412] pr-20 pl-4 text-white placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
        aria-autocomplete="list"
        {...aria}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-0 right-10 bottom-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
          aria-label="Clear search"
        >
          <CloseIcon />
        </button>
      ) : null}
      <span className="pointer-events-none absolute top-0 right-0 bottom-0 flex w-10 items-center justify-center">
        <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
      </span>
    </div>
  );
});
