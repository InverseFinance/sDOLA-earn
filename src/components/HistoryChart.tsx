'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ChartItemData } from '@/pages';
import { formatApy, formatUsd } from '@/lib/utils';

type Range = '7d' | '30d' | '90d' | 'all';
type ChartType = 'apy' | 'tvl';

const RANGES: { label: string; key: Range; days: number }[] = [
  { label: '7D',  key: '7d',  days: 7   },
  { label: '30D', key: '30d', days: 30  },
  { label: '90D', key: '90d', days: 90  },
  { label: 'ALL', key: 'all', days: Infinity },
];

function formatDate(timestamp: number, range: Range): string {
  const d = new Date(timestamp * 1000);
  if (range === '7d') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (range === 'all') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label, type }: any) {
  if (!active || !payload?.[0]) return null;
  const fmt = type === 'apy' ? formatApy : formatUsd;
  return (
    <div className="bg-card-bg border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="font-mono font-semibold text-accent">{fmt(payload[0].value)}</p>
    </div>
  );
}

interface HistoryChartProps {
  data: ChartItemData[];
  type: ChartType;
}

export function HistoryChart({ data, type }: HistoryChartProps) {
  const [range, setRange] = useState<Range>('90d');

  const chartData = useMemo(() => {
    const now = Date.now() / 1000;
    const days = RANGES.find(r => r.key === range)?.days ?? Infinity;
    return [...data]
      .filter(d => days === Infinity || d.timestamp >= now - days * 86400)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(d => ({
        date: formatDate(d.timestamp, range),
        value: type === 'apy' ? d.apy : d.tvlUsd,
      }));
  }, [data, range, type]);

  const gradientId = `chartGrad-${type}`;

  return (
    <div className="pt-3 pb-1">
      {/* Range selector */}
      <div className="flex gap-1 justify-end mb-3">
        {RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors duration-150 cursor-pointer ${
              range === r.key
                ? 'bg-accent/[0.12] text-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFC042" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#FFC042" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4A5480', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            content={<CustomTooltip type={type} />}
            cursor={{ stroke: 'rgba(255,192,66,0.18)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FFC042"
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: '#FFC042', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
