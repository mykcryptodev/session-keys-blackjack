import { watchContractEvent } from '@wagmi/core'
import { type FC } from "react";

import { DEFAULT_CHAIN } from '~/constants';
import { abi } from '~/constants/abi/blackjack';
import { BLACKJACK } from '~/constants/addresses';
import { wagmiConfig } from '~/providers/OnchainProviders';

type Props = {
  onEvent: (eventName: string) => void;
}
export const Watch: FC<Props> = ({ onEvent }) => {
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    abi,
    chainId: DEFAULT_CHAIN.id,
    eventName: "PlayerJoined",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('PlayerJoined');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    chainId: DEFAULT_CHAIN.id,
    abi,
    eventName: "GameStarted",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('GameStarted');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    chainId: DEFAULT_CHAIN.id,
    abi,
    eventName: "CardsDealt",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('CardsDealt');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    chainId: DEFAULT_CHAIN.id,
    abi,
    eventName: "PlayerAction",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('PlayerAction');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    chainId: DEFAULT_CHAIN.id,
    abi,
    eventName: "DealerAction",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('DealerAction');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
    chainId: DEFAULT_CHAIN.id,
    abi,
    eventName: "GameEnded",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('GameEnded');
    },
  });

  return (
    <div />
  )
};