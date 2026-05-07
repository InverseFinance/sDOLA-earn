'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { ChartItemData } from '@/pages';
import { formatApy, formatUsd } from '@/lib/utils';

type Range = '7d' | '30d' | '90d' | '1y' | 'all';
type ChartType = 'apy' | 'tvl';

const RANGES: { label: string; key: Range; days: number }[] = [
  { label: '7D',  key: '7d',  days: 7   },
  { label: '30D', key: '30d', days: 30  },
  { label: '90D', key: '90d', days: 90  },
  { label: '1Y',  key: '1y',  days: 365 },
  { label: 'ALL', key: 'all', days: Infinity },
];

function formatTick(timestamp: number, range: Range): string {
  const d = new Date(timestamp);
  if (range === 'all') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYTick(value: number, type: ChartType): string {
  if (type === 'apy') return `${value.toFixed(0)}%`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function CustomTooltip({ active, payload, type }: any) {
  if (!active || !payload?.[0]) return null;
  const fmt = type === 'apy' ? formatApy : formatUsd;
  const ts: number = payload[0]?.payload?.timestamp;
  const dateLabel = ts
    ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return (
    <div className="bg-card-bg border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-text-muted mb-1">{dateLabel}</p>
      <p className="font-mono font-semibold text-accent">{fmt(payload[0].value)}</p>
    </div>
  );
}

interface HistoryChartProps {
  data: ChartItemData[];
  type: ChartType;
}

export function HistoryChart({ data, type }: HistoryChartProps) {
  const [range, setRange] = useState<Range>('1y');

  const chartData = useMemo(() => {
    const now = Date.now();
    const days = RANGES.find(r => r.key === range)?.days ?? Infinity;
    return [...data]
      .filter(d => days === Infinity || d.timestamp >= now - days * 86400 * 1000)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(d => ({
        timestamp: d.timestamp,
        value: type === 'apy' ? d.apy : d.tvlUsd,
      }));
  }, [data, range, type]);

  // Jan 1 boundaries within the visible data range
  const yearLines = useMemo(() => {
    if (chartData.length < 2) return [];
    const minTs = chartData[0].timestamp;
    const maxTs = chartData[chartData.length - 1].timestamp;
    const startYear = new Date(minTs).getUTCFullYear();
    const endYear = new Date(maxTs).getUTCFullYear();
    const lines: { ts: number; year: number }[] = [];
    for (let y = startYear + 1; y <= endYear; y++) {
      lines.push({ ts: Date.UTC(y, 0, 1), year: y });
    }
    return lines;
  }, [chartData]);

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
        <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: type === 'tvl' ? 4 : 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFC042" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#FFC042" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(ts) => formatTick(ts, range)}
            tick={{ fill: '#4A5480', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => formatYTick(v, type)}
            tick={{ fill: '#4A5480', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={type === 'tvl' ? 38 : 28}
            tickCount={4}
            yAxisId="left" 
            orientation="left"
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => formatYTick(v, type)}
            tick={{ fill: '#4A5480', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={type === 'tvl' ? 52 : 36}
            tickCount={4}
            yAxisId="right" 
            orientation="right"
          />
          <Tooltip
            content={<CustomTooltip type={type} />}
            cursor={{ stroke: 'rgba(255,192,66,0.18)', strokeWidth: 1 }}
          />

          {/* Year boundary lines */}
          {yearLines.map(({ ts, year }) => (
            <ReferenceLine
              key={year}
              x={ts}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray="3 4"
              yAxisId="left"
              label={{
                value: String(year),
                position: 'insideTopRight',
                fill: '#4A5480',
                fontSize: 9,
                dy: 4,
                dx: -4,
              }}
            />
          ))}

          <Area
            type="monotone"
            dataKey="value"
            stroke="#FFC042"
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: '#FFC042', strokeWidth: 0 }}
            isAnimationActive={true}
            yAxisId="left"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FFC042"
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: '#FFC042', strokeWidth: 0 }}
            isAnimationActive={true}
            yAxisId="right"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
