'use client';

import { useEffect, useRef, useState } from 'react';

/** Close on outside interaction, including opening another dropdown. */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setIsOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [isOpen]);

  return { ref, isOpen, setIsOpen };
}
