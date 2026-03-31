'use client';

import { useState } from 'react';
import { formatApy, formatUsd } from '@/lib/utils';
import { StakingData, ChartItemData } from '@/pages';
import { HistoryChart } from './HistoryChart';

type ActiveChart = 'apy' | 'tvl' | null;

export function StatsBar({
  stakingData,
  chartData,
}: {
  stakingData: StakingData;
  chartData?: ChartItemData[];
}) {
  const [activeChart, setActiveChart] = useState<ActiveChart>(null);

  function toggle(chart: 'apy' | 'tvl') {
    if (!chartData?.length) return;
    setActiveChart(prev => (prev === chart ? null : chart));
  }

  const hasChart = !!chartData?.length;

  return (
    <div className="card-shine relative bg-card-bg border border-white/[0.05] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Stats row */}
      <div className="relative flex">
        {/* APY */}
        <button
          onClick={() => toggle('apy')}
          disabled={!hasChart}
          className={`flex-1 min-w-0 p-5 text-left transition-colors duration-150 ${
            hasChart ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'
          } ${activeChart === 'apy' ? 'bg-white/[0.025]' : ''}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">
              Current APY
            </p>
            {hasChart && (
              <span className="text-text-muted text-[8px] transition-transform duration-200" style={{
                display: 'inline-block',
                transform: activeChart === 'apy' ? 'rotate(90deg)' : 'rotate(0deg)',
              }}>▶</span>
            )}
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight gradient-text">
            {formatApy(stakingData.apy)}
          </p>
        </button>

        <div className="w-px bg-white/[0.05] self-stretch shrink-0" />

        {/* TVL */}
        <button
          onClick={() => toggle('tvl')}
          disabled={!hasChart}
          className={`flex-1 min-w-0 p-5 text-left transition-colors duration-150 ${
            hasChart ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'
          } ${activeChart === 'tvl' ? 'bg-white/[0.025]' : ''}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">
              Total Value Locked
            </p>
            {hasChart && (
              <span className="text-text-muted text-[8px] transition-transform duration-200" style={{
                display: 'inline-block',
                transform: activeChart === 'tvl' ? 'rotate(90deg)' : 'rotate(0deg)',
              }}>▶</span>
            )}
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {formatUsd(stakingData.tvlUsd)}
          </p>
        </button>
      </div>

      {/* Expandable chart */}
      {activeChart && chartData && (
        <div className="relative border-t border-white/[0.04] px-5 pb-3">
          <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium pt-3 mb-1">
            {activeChart === 'apy' ? 'APY History' : 'TVL History'}
          </p>
          <HistoryChart data={chartData} type={activeChart} />
        </div>
      )}
    </div>
  );
}
