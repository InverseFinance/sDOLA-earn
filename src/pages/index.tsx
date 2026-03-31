import Head from 'next/head';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StakingCard } from '@/components/StakingCard';
import { Footer } from '@/components/Footer';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';

export interface StakingData {
  apy: number;
  projectedApy: number;
  apy30d: number;
  tvlUsd: number;
  totalAssets: number;
  dolaPriceUsd: number;
}

export const getServerSideProps: GetServerSideProps<{ data: StakingData | null }> = async () => {
  try {
    const res = await fetch('https://www.inverse.finance/api/dola-staking');
    const data: StakingData = await res.json();
    return { props: { data } };
  } catch (e) {
    console.error(e);
    return { props: { data: null } };
  }
};

export default function Home({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const title = 'sDOLA Earn - Yield Bearing Stablecoin | Inverse Finance';
  const description = 'Earn passive stablecoin yield thanks to sDOLA. Non-custodial, audited, and always liquid. Start earning in one click.';
  return (
    <div className="page-bg dot-grid flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="sDOLA, DOLA, stablecoin, yield, staking, DeFi, Inverse Finance, decentralized finance, earn, ERC-4626" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://sdola.inverse.finance" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
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
          {data ? (
            <StatsBar stakingData={data} />
          ) : (
            <div className="bg-card-bg border border-white/[0.05] rounded-2xl p-5 h-24 animate-pulse" />
          )}
        </div>

        <div>
          <StakingCard stakingData={data} />
        </div>

      </main>
      <Footer />
    </div>
  );
}
