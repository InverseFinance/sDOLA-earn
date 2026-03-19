'use client';

import { formatApy, formatUsd } from '@/lib/utils';

interface StatsBarProps {
  data: {
    apy: number;
    projectedApy: number;
    apy30d: number;
    tvlUsd: number;
  };
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="group relative bg-card-bg/80 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/[0.1]">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <p className="relative text-text-muted text-[11px] uppercase tracking-widest font-medium mb-2">{label}</p>
      <p className={`relative text-xl font-bold font-mono tracking-tight ${highlight ? 'text-accent-hover' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

export function StatsBar({ data }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Current APY" value={formatApy(data.apy)} highlight />
      <StatCard label="TVL" value={formatUsd(data.tvlUsd)} />
    </div>
  );
}
