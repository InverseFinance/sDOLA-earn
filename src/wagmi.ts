import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
} from 'wagmi/chains';
import { fallback, http, injected, unstable_connector } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'sDOLA Earn',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'placeholder',
  chains: [
    mainnet,
  ],
  ssr: true,
    transports: {
    [mainnet.id]: fallback([
      unstable_connector(injected),
      http(),
    ]),
  },
});
