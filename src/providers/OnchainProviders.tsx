import { OnchainKitProvider } from '@coinbase/onchainkit';
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Buffer } from "buffer";
import { type FC, useEffect, useState } from 'react';
import { createPublicClient } from 'viem';
import { createConfig, http,WagmiProvider } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

import { APP_NAME, DEFAULT_CHAIN, EAS_SCHEMA_ID, SUPPORTED_CHAINS } from '~/constants';
import PermissionsProvider from '~/contexts/PermissionsContext';
import { env } from '~/env';

import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
 
const connectors = connectorsForWallets( 
  [
    {
      groupName: 'Other Wallets',
      wallets: [
        rainbowWallet, 
        metaMaskWallet, 
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: APP_NAME,
    projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
);

// make an object where each key is a chain id and the value is http() transport
// TODO: make these rpcs non public
const transports = SUPPORTED_CHAINS.reduce<Record<number, ReturnType<typeof http>>>((acc, chain) => {
  acc[chain.id] = http();
  return acc;
}, {});

export const wagmiConfig = createConfig({
  connectors: [coinbaseWallet({
    preference: 'smartWalletOnly',
  }), ...connectors],
  chains: SUPPORTED_CHAINS,
  syncConnectedChain: true,
  transports,
});

export const publicClient = createPublicClient({
  chain: DEFAULT_CHAIN,
  transport: http(),
});

type Props = {
  children: React.ReactNode;
}

const OnchainProviders: FC<Props> = ({ children }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={env.NEXT_PUBLIC_CDP_API_KEY}
          chain={DEFAULT_CHAIN}
          schemaId={EAS_SCHEMA_ID}
        >
          <RainbowKitProvider modalSize="compact">
            <PermissionsProvider>
              {children}
            </PermissionsProvider>
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
 
export default OnchainProviders;