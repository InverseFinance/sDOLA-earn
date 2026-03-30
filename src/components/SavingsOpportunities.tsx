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
}: {
    tokens: SupportedToken[];
    apy: number;
    totalAssets: number;
    dolaPriceUsd?: number;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { estimatedNewApy, totalIldeUsd, estimatedYearlyGain } = estimateOppurtunities({ apy, totalAssets, tokens, dolaPriceUsd });
    console.log(totalIldeUsd)

    if (totalIldeUsd <= 0) return null;

    const idleTokens = tokens.filter(t => t.isIdleStable && t.usd > 0);

    return (
        <div className="mb-3 border-b border-white/[0.04] pb-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between gap-2 text-sm hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-yellow-400 text-xs">◆</span>
                    <span className="text-text-muted text-xs whitespace-nowrap">
                        Idle stables: <span className="text-foreground font-mono">{formatUsd(totalIldeUsd)}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-text-muted text-xs">
                        Est. APY <span className="text-accent font-mono font-semibold">{formatApy(estimatedNewApy)}</span>
                    </span>
                    <span className="text-green-400 font-mono font-semibold text-xs">
                        +{formatUsd(estimatedYearlyGain)}/yr
                    </span>
                    <span className="text-text-muted text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1.5 pt-2">
                    {idleTokens.map(token => {
                        const tokenYearlyGain = estimatedNewApy / 100 * token.usd;
                        return (
                            <div key={token.address} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <img src={token.logoUri} alt={token.symbol} className="w-4 h-4 rounded-full" />
                                    <span className="text-text-muted">{token.symbol}</span>
                                    <span className="text-foreground font-mono">{formatUsd(token.usd)}</span>
                                </div>
                                <span className="text-green-400 font-mono">+{formatUsd(tokenYearlyGain)}/yr</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
