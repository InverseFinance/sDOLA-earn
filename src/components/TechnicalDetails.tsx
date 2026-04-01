'use client';

import Image from 'next/image';
import { DOLA_ADDRESS, SDOLA_ADDRESS } from '@/lib/contracts';
import { useLanguage } from '@/lib/useLanguage';

const ETHERSCAN = 'https://etherscan.io/address/';

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const contracts = [
  {
    label: 'sDOLA',
    address: SDOLA_ADDRESS,
    logo: '/sDOLAx128.png',
  },
  {
    label: 'DOLA',
    address: DOLA_ADDRESS,
    logo: '/dola-small.png',
  },
];

export function TechnicalDetails() {
  const { t } = useLanguage();

  return (
    <div className="bg-card-bg border border-white/[0.05] rounded-2xl p-5 space-y-5 text-[12px]">

      {/* Contract addresses */}
      <div className="space-y-2">
        <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">{t.contracts}</p>
        {contracts.map(({ label, address, logo }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Image src={logo} alt={label} width={20} height={20} className="rounded-full shrink-0" />
            <span className="text-text-muted font-medium w-10 shrink-0">{label}</span>
            <a
              href={`${ETHERSCAN}${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:text-accent/80 font-mono transition-colors duration-150"
              title={address}
            >
              {shortAddress(address)}
            </a>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.04]" />

      {/* sDOLA / DOLA relationship */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-text-muted text-[10px] tracking-[0.15em] font-medium">{t.sdolaVaultTitle}</p>
        </div>
        <p className="text-text-secondary leading-relaxed">
          {t.sdolaVaultBody}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-text-muted text-[10px] tracking-[0.15em] font-medium">{t.zapsTitle}</p>
        </div>
        <p className="text-text-secondary leading-relaxed">
          {t.zapsBodyPrefix}{' '}
          <a
            href="https://www.enso.build"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline hover:text-accent/80 font-mono transition-colors duration-150"
            title="Enso"
          >
            Enso
          </a>
        </p>
      </div>

    </div>
  );
}
