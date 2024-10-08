import { baseSepolia, type Chain } from "wagmi/chains";

import { env } from "~/env";

export const APP_NAME = "Farcard Blackjack";
export const APP_DESCRIPTION = "Play blackjack with your favorite farcards!";
export const APP_URL = "https://session-keys-blackjack.vercel.app";
export const SUPPORTED_CHAINS: readonly [Chain, ...Chain[]] = [{
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: [`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${env.NEXT_PUBLIC_CDP_API_KEY}`] as const,
    },
  },
}];
export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];
export const EAS_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";