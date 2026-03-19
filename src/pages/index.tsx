import Head from 'next/head';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StakingCard } from '@/components/StakingCard';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';

interface StakingData {
  apy: number;
  projectedApy: number;
  apy30d: number;
  tvlUsd: number;
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
  const description = 'Earn decentralized organic yield by depositing DOLA into sDOLA. No lockup, no minimum deposit. Powered by Inverse Finance.';

  return (
    <>
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
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">sDOLA Yield Bearing Stablecoin</h1>
          <p className="text-text-muted text-sm">Decentralized Organic Yield without lockup</p>
        </div>
        {data ? (
          <StatsBar data={data} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card-bg border border-card-border rounded-xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        )}
        <StakingCard />
      </main>
    </>
  );
}
