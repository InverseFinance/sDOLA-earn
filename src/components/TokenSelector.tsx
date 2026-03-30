'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { SupportedToken } from '@/lib/tokens';
import { formatUsd } from '@/lib/utils';

interface TokenSelectorProps {
  tokens: SupportedToken[];
  selected: SupportedToken;
  onSelect: (token: SupportedToken) => void;
  balances?: Record<string, string>;
}

export function TokenSelector({ tokens, selected, onSelect, balances }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = tokens.filter(t => {
    const r = new RegExp(search, 'i');
    return r.test(t.symbol) || r.test(t.name);
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1.5 bg-surface border border-white/[0.06] rounded-lg px-2.5 py-1.5 hover:border-accent/40 transition-all duration-200"
      >
        <img src={selected.logoUri} alt={selected.symbol} width={18} height={18} className="rounded-full" />
        <span className="text-sm font-medium text-foreground">{selected.symbol}</span>
        <svg
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 right-0 w-64 max-h-72 overflow-y-auto bg-card-bg border border-white/[0.06] rounded-xl shadow-2xl backdrop-blur-sm">
          <input autoFocus className="h-8 w-full px-3 py-2 focus:outline-2" placeholder="Search a token" name="tokenSearch" value={search} onChange={v => setSearch(v.target.value)} />
          {filtered.map((token) => (
            <button
              key={token.address}
              onClick={() => { onSelect(token); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors duration-150 ${token.address === selected.address ? 'bg-accent/[0.08]' : ''
                }`}
            >
              <img src={token.logoUri} alt={token.symbol} width={24} height={24} className="rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{token.symbol}</div>
                <div className="text-xs text-text-muted truncate">{token.name}</div>
              </div>
              {
                balances?.[token.address.toLowerCase()] && (
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs font-mono text-text-secondary">
                      {balances[token.address.toLowerCase()]}
                    </span>
                    {
                      token.usd && <span className="text-xs font-mono text-text-secondary">
                        {token.usd < 1 ? '<$1' : `${formatUsd(token.usd)}`}
                      </span>
                    }
                  </div>
                )
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
