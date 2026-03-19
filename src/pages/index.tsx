'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StakingCard } from '@/components/StakingCard';

interface StakingData {
  apy: number;
  projectedApy: number;
  apy30d: number;
  tvlUsd: number;
}

export default function Home() {
  const [data, setData] = useState<StakingData | null>(null);

  useEffect(() => {
    fetch('https://www.inverse.finance/api/dola-staking')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Stake DOLA</h1>
          <p className="text-text-muted text-sm">Earn yield by staking DOLA into sDOLA</p>
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
