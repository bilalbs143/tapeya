import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';

/**
 * Shared state logic for search-input + popover pairs.
 *
 * @param {{ minLength?: number, debounceMs?: number }} [options]
 */
export function useSearchPopover({ minLength = MIN_SEARCH_LENGTH, debounceMs = DEBOUNCE_MS } = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm.trim(), debounceMs);
  const isOpen = searchTerm.trim().length >= minLength;

  const clear = () => setSearchTerm('');

  const handleOpenChange = (open) => {
    if (!open) clear();
  };

  return { searchTerm, setSearchTerm, debouncedSearch, isOpen, clear, handleOpenChange };
}
