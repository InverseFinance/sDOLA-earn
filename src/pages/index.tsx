import Head from 'next/head';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StakingCard } from '@/components/StakingCard';
import { Footer } from '@/components/Footer';
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
    <div className="flex flex-col min-h-screen">
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
      <main className="relative flex-1 px-4 py-10 max-w-lg mx-auto w-full space-y-6">
        {/* Ambient background glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">sDOLA Yield Bearing Stablecoin</h1>
          <p className="text-text-muted text-sm">Decentralized Organic Yield without lockup</p>
        </div>
        <div className="relative">
          {data ? (
            <StatsBar data={data} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card-bg/80 border border-white/[0.06] rounded-2xl p-4 h-20 animate-pulse" />
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <StakingCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
