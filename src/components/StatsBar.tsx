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

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-foreground text-xl font-bold font-mono">{value}</p>
      {sublabel && <p className="text-text-muted text-xs mt-1">{sublabel}</p>}
    </div>
  );
}

export function StatsBar({ data }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard label="Current APY" value={formatApy(data.apy)} />
      {/* <StatCard
        label="Projected APY"
        value={formatApy(data.projectedApy)}
        sublabel="Next Thursday UTC"
      /> */}
      {/* <StatCard label="30d APY" value={formatApy(data.apy30d)} /> */}
      <StatCard label="TVL" value={formatUsd(data.tvlUsd)} />
    </div>
  );
}
