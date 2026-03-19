import { connectorsForWallets, getDefaultConfig, WalletList } from '@rainbow-me/rainbowkit';
import {
  mainnet,
} from 'wagmi/chains';
import { fallback, http, injected, unstable_connector, createConfig } from 'wagmi';
import binanceWallet from '@binance/w3w-rainbow-connector-v2'
import { injectedWallet, baseAccount, walletConnectWallet, rabbyWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'

const recommendedWalletList: WalletList = [
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet,
      binanceWallet,
      baseAccount,
      rabbyWallet,
      metaMaskWallet,
      walletConnectWallet,
    ],
  },
];

const connectors = connectorsForWallets(
  recommendedWalletList,
  {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'placeholder',
    appName: 'sDOLA Earn',
  }
)

export const config = createConfig({
  ssr: true,
  connectors,
  chains: [mainnet],
  transports: {
    [mainnet.id]: fallback([
      unstable_connector(injected),
      http(),
    ]),
  },
})