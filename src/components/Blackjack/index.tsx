import { type FC, useEffect, useState } from 'react';
import { type Hex, zeroAddress } from 'viem';
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
  const [players, setPlayers] = useState<Hex[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [dealerHandValues, setDealerHandValues] = useState<readonly number[]>([]);
  const [dealerHandSuits, setDealerHandSuits] = useState<readonly number[]>([]);

  const { 
    data,
    refetch,
  } = useReadContract({ 
    address: BLACKJACK, 
    chainId: baseSepolia.id,
    abi,
    functionName: 'getGameState',
  });
  console.log({data});

  useEffect(() => {
    if (data?.playerAddresses) {
      setPlayers(data?.playerAddresses.map((player) => player).concat(zeroAddress));
    }
    if (data?.currentPlayerIndex) {
      setCurrentPlayerIndex(data.currentPlayerIndex);
    }
    if (data?.dealerHandValues && data?.dealerHandSuits) {
      setDealerHandValues(data.dealerHandValues);
      setDealerHandSuits(data.dealerHandSuits);
    }
  }, [data]);

  // every 5 seconds, refetch the game state
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  console.log({ players });

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
      {players.map((player, index) => (
        <Hand 
          key={player} 
          playerIndex={index} 
          isCurrentPlayer={currentPlayerIndex}
          isDealerHand={index === players.length - 1}
          dealerHandValues={dealerHandValues}
          dealerHandSuits={dealerHandSuits}
        />
      ))}
    </div>
  );
};

export default Blackjack;