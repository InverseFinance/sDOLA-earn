import Head from 'next/head';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StakingCard } from '@/components/StakingCard';
import { SdolaBalanceCard } from '@/components/SdolaBalanceCard';
import { Footer } from '@/components/Footer';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { TechnicalDetails } from '@/components/TechnicalDetails';

export interface StakingData {
  apy: number;
  projectedApy: number;
  apy30d: number;
  tvlUsd: number;
  totalAssets: number;
  totalAssets30d: number;
  dolaPriceUsd: number;
}

export interface ChartItemData {
  apy: number;
  timestamp: number;
  tvlUsd: number;
}

export const getServerSideProps: GetServerSideProps<{ stakingData: StakingData, chartData: ChartItemData[] }> = async () => {
  try {
    const [
      stakingData,
      historyData,
    ] = await Promise.all([
      fetch('https://www.inverse.finance/api/dola-staking').then(r => r.json()),
      fetch('https://www.inverse.finance/api/dola-staking/history').then(r => r.json()),
    ]);

    const chartData = historyData.totalEntries
      .filter(e => e.timestamp != null && e.apy != null)
      .map(e => ({
        timestamp: e.timestamp,
        apy: e.apy,
        tvlUsd: e.tvlUsd || e.sDolaTotalAssets || 0,
      }));

    return {
      props: {
        stakingData,
        chartData,
      }
    };
  } catch (e) {
    console.error(e);
    return { props: { stakingData: null, chartData: null } };
  }
};

export default function Home({ stakingData, chartData }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const title = 'sDOLA Earn - Yield Bearing Stablecoin | Inverse Finance';
  const description = 'Earn passive stablecoin yield thanks to sDOLA. Non-custodial, audited, and always liquid. Start earning in one click.';
  return (
    <div className="page-bg dot-grid flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="sDOLA, DOLA, stablecoin, yield, staking, DeFi, Inverse Finance, decentralized finance, earn, ERC-4626" />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={description} />
        <meta name="og:url" content="https://sdola.inverse.finance" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        <meta name="og:type" content="website" />
        <meta name="og:site_name" content="sDOLA Earn" />
        <meta name="og:image" content="https://inverse.finance/assets/social-previews/sDOLA-v3.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@InverseFinance" />
        <meta name="twitter:image" content="https://inverse.finance/assets/social-previews/sDOLA-v3.jpeg" />

        <link rel="canonical" href="https://sdola.inverse.finance" />
      </Head>
      <Header />
      <main className="relative z-10 flex-1 px-4 py-10 max-w-lg mx-auto w-full space-y-5">

        <div className="text-center space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Earn stable yield with <span className="gradient-text">sDOLA</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Automated &middot; Non-Custodial &middot; Stablecoin Yield
          </p>
        </div>

        <div>
          {stakingData ? (
            <StatsBar stakingData={stakingData} chartData={chartData} />
          ) : (
            <div className="bg-card-bg border border-white/[0.05] rounded-2xl p-5 h-24 animate-pulse" />
          )}
        </div>

        {stakingData && (
          <SdolaBalanceCard stakingData={stakingData} />
        )}

        <div>
          <StakingCard stakingData={stakingData} />
        </div>

        <p className="text-center text-text-muted text-[12px] leading-relaxed px-2">
          Disclaimer: the yield rates are variable and not guaranteed. While sDOLA is an audited ERC4626 vault, interacting with DeFi protocols involves risk, including the potential loss of funds or depeg of the stablecoin.
        </p>

        <div className="text-center">
          <button
            onClick={() => setShowTechDetails(v => !v)}
            className="text-text-muted/80 cursor-pointer hover:text-text-muted text-[11px] transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <span
              className="text-[8px] transition-transform duration-200 inline-block"
              style={{ transform: showTechDetails ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >▶</span>
            {showTechDetails ? 'Hide technical details' : 'Show technical details'}
          </button>
        </div>

        {showTechDetails && <TechnicalDetails />}

      </main>
      <Footer />
    </div>
  );
}
