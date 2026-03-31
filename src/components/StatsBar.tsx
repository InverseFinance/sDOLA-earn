'use client';

import { formatApy, formatUsd } from '@/lib/utils';
import { StakingData } from '@/pages';

export function StatsBar({ stakingData }: { stakingData: StakingData }) {
  return (
    <div className="card-shine relative bg-card-bg border border-white/[0.05] rounded-2xl p-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-center">
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium mb-1.5">
            Current APY
          </p>
          <p className="text-3xl font-bold font-mono tracking-tight gradient-text">
            {formatApy(stakingData.apy)}
          </p>
        </div>
        <div className="w-px h-10 bg-white/[0.06] mx-6 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium mb-1.5">
            Total Value Locked
          </p>
          <p className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {formatUsd(stakingData.tvlUsd)}
          </p>
        </div>
      </div>
    </div>
  );
}
