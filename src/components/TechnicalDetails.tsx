import Image from 'next/image';
import { DOLA_ADDRESS, SDOLA_ADDRESS } from '@/lib/contracts';

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
  return (
    <div className="bg-card-bg border border-white/[0.05] rounded-2xl p-5 space-y-5 text-[12px]">

      {/* Contract addresses */}
      <div className="space-y-2">
        <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">Contracts</p>
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

      {/* ERC-4626 explanation */}
      {/* <div className="space-y-1.5">
        <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] font-medium">What is ERC-4626?</p>
        <p className="text-text-secondary leading-relaxed">
          ERC-4626 is a standard for tokenized yield-bearing vaults on Ethereum, here the vault is sDOLA while the underlying asset is the DOLA stablecoin, when depositing into sDOLA, the deposit token is converted to DOLA first, you then receive a fixed amount of shares (the sDOLA balance) and those shares will grow in DOLA terms over time.
        </p>
      </div>

      <div className="border-t border-white/[0.04]" /> */}

      {/* sDOLA / DOLA relationship */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-text-muted text-[10px] tracking-[0.15em] font-medium">The sDOLA vault &amp; its underlying DOLA stablecoin</p>
        </div>
        <p className="text-text-secondary leading-relaxed">
          <b className="text-accent">DOLA</b> is a decentralized stablecoin issued by <b className="text-accent">Inverse Finance</b> soft-pegged to $1 while <b className="text-accent">sDOLA</b> is the liquid yield-bearing vault version of it (using the ERC-4226 Ethereum standard): when you deposit DOLA (or convert from another token) into the sDOLA vault, you receive sDOLA shares. The vault continuously earns yield from an onchain auction system that sells DBR tokens (credit tokens consumed by loan takers on Inverse Finance) for DOLA tokens, which makes each sDOLA share redeemable for a growing amount of DOLA over time. You always hold sDOLA while the underlying DOLA balance accrues, there is no manual claiming or compounding to do.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-text-muted text-[10px] tracking-[0.15em] font-medium">Converting and &quot;zaps&quot;</p>
        </div>
        <p className="text-text-secondary leading-relaxed">
          Conversions from non-DOLA to sDOLA is powered by the third-party <a
              href={`https://www.enso.build`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:text-accent/80 font-mono transition-colors duration-150"
              title={'Enso'}
            >
              Enso
            </a>
        </p>
      </div>

    </div>
  );
}
