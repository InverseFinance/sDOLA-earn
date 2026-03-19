'use client';

import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-md" />
            <Image alt="sDOLA" src="sDOLAx128.png?a" className="relative w-9 h-9 rounded-full" />
          </div>
          <span className="font-semibold text-base tracking-tight">sDOLA Earn</span>
        </div>
        <ConnectButton
          accountStatus={{ smallScreen: 'address', largeScreen: 'full' }}
          chainStatus={'icon'}
          showBalance={{ smallScreen: false, largeScreen: true }}
        />
      </div>
    </header>
  );
}
