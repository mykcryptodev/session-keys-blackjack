import { type FC, useEffect } from 'react';
import { zeroAddress } from 'viem';
import { useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import Action from "~/components/Blackjack/Action";
import Bet from "~/components/Blackjack/Bet";
import Hand from "~/components/Blackjack/Hand";
import { Watch } from "~/components/Blackjack/Watch";
import { GrantPermissions } from "~/components/Wallet/GrantPermissions";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

export const Blackjack: FC = () => {
  const { 
    data,
    refetch,
  } = useReadContract({ 
    address: BLACKJACK, 
    chainId: baseSepolia.id,
    abi,
    functionName: 'getGameState',
  });

  // every 5 seconds, refetch the game state
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!data) return null;
  return (
    <div className="flex flex-col gap-2">
      <Watch onEvent={() => void refetch()} />
      <GrantPermissions />
      <Bet onGameJoined={refetch} />
      <Action btnLabel="Deal" functionName="startDealing" onActionSuccess={refetch} />
      <Action btnLabel="Stand" functionName="stand" onActionSuccess={refetch} />
      <Action btnLabel="Hit" functionName="hit" onActionSuccess={refetch} />
      <Action btnLabel="Play Dealer" functionName="playDealer" onActionSuccess={refetch} />
      <Action btnLabel="Settle Game" functionName="settleGame" onActionSuccess={refetch} />
      {data.playerAddresses.concat(zeroAddress).map((player, index) => (
        <Hand 
          key={player} 
          playerIndex={index} 
          isCurrentPlayer={data.currentPlayerIndex}
          isDealerHand={index === data.playerAddresses.length}
          dealerHandValues={data.dealerHandValues}
          dealerHandSuits={data.dealerHandSuits}
        />
      ))}
    </div>
  );
};

export default Blackjack;