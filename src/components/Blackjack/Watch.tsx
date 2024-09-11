import { watchContractEvent } from '@wagmi/core'
import { type FC } from "react";

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
    eventName: "PlayerJoined",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('PlayerJoined');
    },
  });
  watchContractEvent(wagmiConfig, {
    address: BLACKJACK,
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
    abi,
    eventName: "GameEnded",
    poll: true,
    onLogs(logs) {
      console.log(logs);
      void onEvent('PlayerAction');
    },
  });

  return (
    <div>hello</div>
  )
};