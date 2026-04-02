'use client';

import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from '@/lib/useTheme';
import { useLanguage } from '@/lib/useLanguage';
import { LANG_LABELS, LANG_FLAGS, type Lang } from '@/lib/i18n';
import { useState, useRef, useEffect } from 'react';

const LANGS = Object.entries(LANG_LABELS) as [Lang, string][];

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const sDolaPart = <div className="flex items-center gap-2.5">
    <div className="relative">
      <div className="absolute inset-0 bg-accent/30 rounded-full blur-sm" />
      <Image
        alt="sDOLA"
        src="/sDOLAx128.png"
        width={32}
        height={32}
        className="relative w-8 h-8 rounded-full"
      />
    </div>
    <div className="flex flex-col items-baseline gap-0">
      <span className="font-bold text-sm tracking-tight gradient-text">sDOLA</span>
      <span className="text-text-muted text-xs font-light tracking-wide">Earn</span>
    </div>
  </div>

  const connectBtnPart = <ConnectButton
    accountStatus={{ smallScreen: 'address', largeScreen: 'full' }}
    chainStatus={'icon'}
    showBalance={false}
  />;

  const themePart = <button
    onClick={toggleTheme}
    title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    className="text-text-muted hover:text-text-secondary transition-colors duration-150 p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
  >
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>;

  const langPart = (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-text-muted hover:text-text-secondary transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[11px] font-medium tracking-wide flex items-center gap-1"
      >
        <span>{LANG_FLAGS[lang]}</span>
        <span>{LANG_LABELS[lang]}</span>
        <span className="text-[8px]" style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}>▼</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card-bg border border-white/[0.08] rounded-xl shadow-2xl py-1 min-w-[86px]">
          {LANGS.map(([code, label]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors duration-150 cursor-pointer flex items-center gap-2 ${lang === code
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]'
                }`}
            >
              <span>{LANG_FLAGS[code]}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        {sDolaPart}
        {connectBtnPart}
        <div className="flex items-center gap-3">
          {langPart}
          {themePart}
        </div>
      </div>
    </header>
  );
}
