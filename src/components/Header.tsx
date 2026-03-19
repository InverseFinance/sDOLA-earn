'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-card-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="sDOLAx128.png?a" className="w-10 h-10 rounded-full" />
          <span className="font-semibold text-lg">sDOLA Earn</span>
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
