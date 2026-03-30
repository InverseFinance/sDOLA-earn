import { formatUnits } from 'viem';

export function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatApy(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatBalance(value: bigint, decimals: number = 18, maxDecimals: number = 4): string {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction] = formatted.split('.');
  if (!fraction) return addCommas(whole);
  return `${addCommas(whole)}.${fraction.slice(0, maxDecimals)}`;
}

export function formatTokenAmount(weiValue: string, decimals: number, maxDecimals: number = 4): string {
  return formatBalance(BigInt(weiValue), decimals, maxDecimals);
}

function addCommas(n: string): string {
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
