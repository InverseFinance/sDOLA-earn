'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { SDOLA_ADDRESS, ERC4626_ABI } from '@/lib/contracts';
import { formatBalance } from '@/lib/utils';
import { StakingData } from '@/pages';

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function withCommas(numStr: string): string {
  const [whole, fraction] = numStr.split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction != null ? `${formatted}.${fraction}` : formatted;
}

export function SdolaBalanceCard({ stakingData }: { stakingData: StakingData }) {
  const { address } = useAccount();
  const [displayDola, setDisplayDola] = useState<string | null>(null);
  const baseRef = useRef<{ value: number; timestamp: number } | null>(null);

  const { data: sdolaBalance } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const hasBalance = !!sdolaBalance && sdolaBalance > 0n;

  const { data: dolaEquivalent } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'convertToAssets',
    args: hasBalance ? [sdolaBalance] : undefined,
    query: { enabled: hasBalance },
  });

  // When on-chain value arrives or updates, reset the interpolation base
  useEffect(() => {
    if (dolaEquivalent == null) return;
    const value = parseFloat(formatUnits(dolaEquivalent as bigint, 18));
    baseRef.current = { value, timestamp: Date.now() };
    setDisplayDola(value.toFixed(8));
  }, [dolaEquivalent]);

  // Tick every 50ms, interpolating forward from the last known on-chain value
  useEffect(() => {
    if (!hasBalance || !stakingData?.apy) return;
    const interval = setInterval(() => {
      if (!baseRef.current) return;
      const { value, timestamp } = baseRef.current;
      const elapsed = Date.now() - timestamp;
      const perMs = value * (stakingData.apy / 100) / YEAR_MS;
      setDisplayDola((value + elapsed * perMs).toFixed(8));
    }, 50);
    return () => clearInterval(interval);
  }, [hasBalance, stakingData?.apy, dolaEquivalent]);

  if (!hasBalance) return null;

  const sdolaFormatted = formatBalance(sdolaBalance, 18, 4);
  const dolaValue = displayDola ? parseFloat(displayDola) : null;
  const dolaPriceUsd = stakingData?.dolaPriceUsd ?? 1;
  const apy = stakingData?.apy ?? 0;
  const yearlyYieldUsd = dolaValue != null ? dolaValue * (apy / 100) * dolaPriceUsd : null;
  const monthlyYieldUsd = yearlyYieldUsd != null ? yearlyYieldUsd / 12 : null;

  return (
    <div className="card-shine relative bg-card-bg border border-white/[0.05] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="relative p-5 space-y-4">

        <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">
          Your Position
        </p>

        <div className="flex">
          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-[10px] tracking-[0.12em] font-medium mb-1.5">
              sDOLA BALANCE
            </p>
            <p className="text-xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {sdolaFormatted}
            </p>
          </div>

          <div className="w-px bg-white/[0.05] self-stretch shrink-0 mx-5" />

          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.12em] font-medium mb-1.5">
              in DOLA stablecoin terms
            </p>
            <p className="text-xl font-bold font-mono tracking-tight gradient-text tabular-nums">
              {displayDola ? withCommas(displayDola) : '—'}
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-4 flex">

          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.12em] font-medium mb-1.5">
              Est. Monthly Yield
            </p>
            <p className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
              {monthlyYieldUsd != null ? `$${withCommas(monthlyYieldUsd.toFixed(2))}` : '—'}
            </p>
          </div>

          <div className="w-px bg-white/[0.05] self-stretch shrink-0 mx-5" />

          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.12em] font-medium mb-1.5">
              Est. Yearly Yield
            </p>
            <p className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
              {yearlyYieldUsd != null ? `$${withCommas(yearlyYieldUsd.toFixed(2))}` : '—'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
