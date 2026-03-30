import { SupportedToken } from "@/lib/tokens"

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
    const totalIldeUsd = tokens.filter(t => t.isIdleStable).reduce((prev, curr) => prev + curr.usd, 0);
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
    dolaPriceUsd,
}: {
    tokens: SupportedToken[];
    apy: number;
    totalAssets: number;
    dolaPriceUsd: number;
}) => {
    const estimates = estimateOppurtunities({ apy, totalAssets, tokens, dolaPriceUsd });

    return <div></div>
}