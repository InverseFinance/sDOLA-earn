'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatApy, formatUsd } from '@/lib/utils';
import { StakingData, ChartItemData } from '@/pages';
import { HistoryChart } from './HistoryChart';
import { useLanguage } from '@/lib/useLanguage';

type ActiveChart = 'apy' | 'tvl' | null;

export function StatsBar({
  stakingData,
  chartData,
}: {
  stakingData: StakingData;
  chartData?: ChartItemData[];
}) {
  const [activeChart, setActiveChart] = useState<ActiveChart>(null);
  const [showProjectedInfo, setShowProjectedInfo] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const infoRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!showProjectedInfo) return;
    function onMouseDown(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowProjectedInfo(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showProjectedInfo]);

  function toggleProjectedInfo(e: React.MouseEvent) {
    e.stopPropagation();
    if (!showProjectedInfo && infoRef.current) {
      const rect = infoRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 296),
      });
    }
    setShowProjectedInfo(v => !v);
  }

  function toggle(chart: 'apy' | 'tvl') {
    if (!chartData?.length) return;
    setActiveChart(prev => (prev === chart ? null : chart));
  }

  const hasChart = !!chartData?.length;

  const apy30d = useMemo(() => {
    if (!chartData?.length) return null;
    const cutoff = Date.now() - 30 * 86400 * 1000;
    const recent = chartData.filter(d => d.timestamp >= cutoff);
    if (!recent.length) return null;
    return recent.reduce((sum, d) => sum + d.apy, 0) / recent.length;
  }, [chartData]);

  const nextThursdayLabel = useMemo(() => {
    const now = new Date();
    const daysUntil = ((4 - now.getUTCDay() + 7) % 7) || 7;
    const next = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil,
      0, 0, 0, 0
    ));
    return next.toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    });
  }, []);

  const tvl30d = useMemo(() => {
    if (!chartData?.length) return null;
    const cutoff = Date.now() - 30 * 86400 * 1000;
    const recent = chartData.filter(d => d.timestamp >= cutoff && d.tvlUsd);
    if (!recent.length) return null;
    return recent.reduce((sum, d) => sum + d.tvlUsd, 0) / recent.length;
  }, [chartData]);

  return (
    <div className="card-shine relative bg-card-bg border border-white/[0.05] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Stats row */}
      <div className="relative flex">
        {/* APY */}
        <button
          onClick={() => toggle('apy')}
          disabled={!hasChart}
          className={`flex-1 min-w-0 p-5 text-left transition-colors duration-150 ${hasChart ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'
            } ${activeChart === 'apy' ? 'bg-white/[0.025]' : ''}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">
              {t.currentApy}
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
          <span className="flex flex-row justify-between w-full mt-1.5">
            {apy30d != null && (
              <p className="text-text-muted text-[10px] font-mono ">
                {t.avg30d} <span className="text-text-secondary">{formatApy(stakingData.apy30d)}</span>
              </p>
            )}
            {apy30d != null && (
              <span className="flex items-center gap-1">
                <p className="text-text-muted text-[10px] font-mono">
                  {t.projected} <span className="text-text-secondary">{formatApy(stakingData.projectedApy)}</span>
                </p>
                <button
                  ref={infoRef}
                  onClick={toggleProjectedInfo}
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150 cursor-pointer leading-none"
                  title="About projected APY"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="3" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </button>
              </span>
            )}
          </span>
        </button>

        <div className="w-px bg-white/[0.05] self-stretch shrink-0" />

        {/* TVL */}
        <button
          onClick={() => toggle('tvl')}
          disabled={!hasChart}
          className={`flex-1 min-w-0 p-5 text-left transition-colors duration-150 ${hasChart ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'
            } ${activeChart === 'tvl' ? 'bg-white/[0.025]' : ''}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">
              {t.totalValueLocked}
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
          {tvl30d != null && (
            <p className="text-text-muted text-[10px] font-mono mt-1.5">
              {t.avg30d} <span className="text-text-secondary">{formatUsd(tvl30d)}</span>
            </p>
          )}
        </button>
      </div>

      {/* Projected APY tooltip — portal to escape overflow-hidden */}
      {showProjectedInfo && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-50 bg-card-bg border border-white/[0.08] rounded-xl p-3 shadow-2xl text-[11px] text-text-secondary leading-relaxed space-y-2.5"
          style={{ top: tooltipPos.top, left: tooltipPos.left, width: 288 }}
        >
          <p>{t.projectedApyInfo}</p>
          <div className="border-t border-white/[0.06]" />
          <p>
            {t.projectedApyBecomesOn}{' '}
            <span className="text-foreground font-medium">{nextThursdayLabel}</span>.
          </p>
        </div>,
        document.body
      )}

      {/* Expandable chart */}
      {activeChart && chartData && (
        <div className="relative border-t border-white/[0.04] px-5 pb-3">
          <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium pt-3 mb-1">
            {activeChart === 'apy' ? t.apyHistory : t.tvlHistory}
          </p>
          <HistoryChart data={chartData} type={activeChart} />
        </div>
      )}
    </div>
  );
}
