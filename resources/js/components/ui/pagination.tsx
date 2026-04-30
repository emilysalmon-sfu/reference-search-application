import React, { useMemo } from 'react';
import { router } from '@inertiajs/react';

type PaginationShape = {
  current_page: number;
  last_page: number;
  path?: string;
};

type Props = {
  pagination?: PaginationShape | null; // allow undefined/null
  query?: Record<string, any>;
  maxButtons?: number;
  className?: string;
  onPageChange?: (page: number) => void; // New callback prop
};

function buildPages(current: number, last: number, maxButtons: number) {
  const pages: (number | '...')[] = [];
  if (last <= maxButtons) {
    for (let i = 1; i <= last; i++) pages.push(i);
    return pages;
  }

  const side = Math.floor((maxButtons - 1) / 2);
  let start = Math.max(1, current - side);
  let end = Math.min(last, current + side);

  if (start === 1) end = Math.min(last, start + maxButtons - 1);
  if (end === last) start = Math.max(1, end - maxButtons + 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < last) {
    if (end < last - 1) pages.push('...');
    pages.push(last);
  }

  return pages;
}

export default function Pagination({
  pagination,
  query = {},
  maxButtons = 7,
  className = '',
  onPageChange,
}: Props) {
  // Guard: if no pagination object, render nothing
  if (!pagination) return null;

  const { current_page, last_page, path } = pagination;
  if (typeof current_page !== 'number' || typeof last_page !== 'number') return null;

  const pages = useMemo(
    () => buildPages(current_page, last_page, maxButtons),
    [current_page, last_page, maxButtons]
  );

  const goTo = (page: number) => {
    if (onPageChange) {
      // Use callback if provided
      onPageChange(page);
    } else {
      // Fall back to router navigation
      const base = path ? path : window.location.pathname;
      const url = new URL(base, window.location.origin);

      Object.entries(query || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
      });

      url.searchParams.set('page', String(page));

      router.get(url.pathname + url.search, {}, { preserveState: true, replace: true });
    }
  };

  if (last_page <= 1) return null;

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Pagination">
      <button
        type="button"
        onClick={() => goTo(Math.max(1, current_page - 1))}
        disabled={current_page <= 1}
        className={`${current_page > 1 ? 'cursor-pointer' : ''} rounded-md px-2 py-1 border bg-background/60 text-xs disabled:opacity-50`}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`gap-${idx}`} className="px-2 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p as number)}
              aria-current={p === current_page ? 'page' : undefined}
              className={`cursor-pointer min-w-[32px] rounded-md px-2 py-1 text-xs border ${
                p === current_page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/60 hover:bg-background/80'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => goTo(Math.min(last_page, current_page + 1))}
        disabled={current_page >= last_page}
        className={`${current_page < last_page ? 'cursor-pointer' : ''} rounded-md px-2 py-1 border bg-background/60 text-xs disabled:opacity-50`}
        aria-label="Next page"
      >
        Next ›
      </button>

      <div className="ml-3 text-xs text-muted-foreground">
        Page {current_page} / {last_page}
      </div>
    </nav>
  );
}