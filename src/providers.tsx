import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './wagmi';
import { Toaster } from './components/Toaster';

const client = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: 'sDOLA Earn',
            // learnMoreUrl: 'https://learnaboutcryptowallets.example',
          }}
        >
          {children}
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
