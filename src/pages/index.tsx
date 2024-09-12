import { type NextPage } from "next";
import { useEffect, useState } from 'react';
import { type Hex, zeroAddress } from 'viem';
import { useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import Action from "~/components/Blackjack/Action";
import Bet from "~/components/Blackjack/Bet";
import Hand from "~/components/Blackjack/Hand";
import { Watch } from "~/components/Blackjack/Watch";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

export const Blackjack: NextPage = () => {
  const [players, setPlayers] = useState<Hex[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [dealerHand, setDealerHand] = useState<readonly number[]>([]);

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
    if (data?.[0]) {
      setPlayers(data[0].map((player) => player).concat(zeroAddress));
    }
    if (data?.[8]) {
      setCurrentPlayerIndex(data[8]);
    }
    if (data?.[5]) {
      setDealerHand(data[5]);
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
          dealerHand={dealerHand}
        />
      ))}
    </div>
  );
};

export default Blackjack;
