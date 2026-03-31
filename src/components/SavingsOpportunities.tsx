'use client';

import { useState } from 'react';
import { SupportedToken } from "@/lib/tokens"
import { formatUsd, formatApy } from '@/lib/utils';

export const estimateOppurtunities = ({
    apy,
    totalAssets,
    tokens,
    dolaPriceUsd,
}: {
    tokens: SupportedToken[];
    apy: number;
    totalAssets: number;
    dolaPriceUsd: number;
}) => {
    const totalIldeUsd = tokens.filter(t => t.isIdleStable).reduce((prev, curr) => prev + (curr.usd||0), 0);
    const newTotalAssetsIfInvested = totalAssets + (dolaPriceUsd ? totalIldeUsd / dolaPriceUsd : totalIldeUsd);
    const estimatedNewApy = newTotalAssetsIfInvested ? apy * (totalAssets / newTotalAssetsIfInvested) : 0;
    const estimatedYearlyGain = estimatedNewApy / 100 * totalIldeUsd;

    return {
        estimatedNewApy,
        totalIldeUsd,
        newTotalAssetsIfInvested,
        estimatedYearlyGain,
    }
}

export const SavingsOpportunites = ({
    apy,
    totalAssets,
    tokens,
    dolaPriceUsd = 1,
    onSelectToken,
}: {
    tokens: SupportedToken[];
    apy: number;
    totalAssets: number;
    dolaPriceUsd?: number;
    onSelectToken?: (token: SupportedToken) => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { estimatedNewApy, totalIldeUsd, estimatedYearlyGain } = estimateOppurtunities({ apy, totalAssets, tokens, dolaPriceUsd });

    if (totalIldeUsd <= 0) return null;

    const idleTokens = tokens.filter(t => t.isIdleStable && t.usd >= 1);

    return (
        <div className="mb-3 border-b border-white/[0.04] pb-3 ">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full cursor-pointer flex items-center justify-between gap-2 text-sm hover:opacity-80 transition-opacity flex-col sm:flex-row"
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-yellow-400 text-xs">◆</span>
                    <span className="text-text-muted whitespace-nowrap">
                        Your idle stables: <span className="text-foreground font-mono">{formatUsd(totalIldeUsd)}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {/* <span className="text-text-muted text-xs">
                        Est. APY after deposit: <span className="text-accent font-mono font-semibold">{formatApy(estimatedNewApy)}</span>
                    </span> */}
                    <span className="text-green-400 font-mono font-semibold text-xs">
                        You could earn ~{formatUsd(estimatedYearlyGain)} a year
                    </span>
                    <span className="text-text-muted text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1.5 pt-2">
                    {idleTokens.map(token => {
                        const estimates = estimateOppurtunities({ apy, totalAssets, tokens: [token], dolaPriceUsd }) 
                        const tokenYearlyGain = estimates.estimatedNewApy / 100 * token.usd;
                        return (
                            <button
                                key={token.address}
                                onClick={() => onSelectToken?.(token)}
                                className={`w-full flex items-center justify-between text-xs rounded-lg px-2 py-1 -mx-2 transition-colors duration-150 ${onSelectToken ? 'hover:bg-white/[0.04] cursor-pointer' : ''}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <img src={token.logoUri} alt={token.symbol} className="w-4 h-4 rounded-full" />
                                    <span className="text-text-muted">{token.symbol}</span>
                                    <span className="text-foreground font-mono">{formatUsd(token.usd)}</span>
                                </div>
                                <span className="text-green-400 font-mono">+{formatUsd(tokenYearlyGain)}/yr</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export const SelectedOpportunity = ({
    token,
    apy,
    totalAssets,
    dolaPriceUsd,
    amount,
}: {
    token: SupportedToken
    apy: number
    totalAssets: number
    dolaPriceUsd: number
    amount: number
}) => {
    if (!amount || amount <= 0) return null;

    const depositUsd = amount; // stablecoins: 1 token ≈ $1
    const depositDola = dolaPriceUsd ? depositUsd / dolaPriceUsd : depositUsd;
    const newTotalAssets = totalAssets + depositDola;
    const estimatedNewApy = newTotalAssets ? apy * (totalAssets / newTotalAssets) : 0;
    const estimatedYearlyGain = estimatedNewApy / 100 * depositUsd;

    return (
        <div className="flex justify-between text-sm">
            <div className="flex flex-col gap-0.5">
                <span className="text-text-muted">Est. APY after deposit:</span>
                <span className="text-text-muted">Est. Yearly gains:</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
                <span className="font-mono text-accent font-semibold">{formatApy(estimatedNewApy)}</span>
                <span className="font-mono text-green-400">+{formatUsd(estimatedYearlyGain)}/yr</span>
            </div>
        </div>
    );
}
