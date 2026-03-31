'use client';

import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
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
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight gradient-text">sDOLA</span>
            <span className="text-text-muted text-sm font-light tracking-wide">Earn</span>
          </div>
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
