import { useEffect, useState } from 'react';

/** Returns `value`, but only after it's stopped changing for `delayMs`.
 * Used so the search page fires one request per pause-in-typing, not one
 * per keystroke (spec §2.1: "Do not make a separate search request for
 * every character"). */
export default function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
