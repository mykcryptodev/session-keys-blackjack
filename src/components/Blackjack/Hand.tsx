import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { type FC,useEffect, useState } from "react";
import { type Hex, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { base,baseSepolia } from "wagmi/chains";

import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  playerIndex: number;
  isCurrentPlayer: number;
  isDealerHand: boolean;
  dealerHand?: readonly number[];
};
export const Hand: FC<Props> = ({ 
  playerIndex,
  isCurrentPlayer,
  isDealerHand,
  dealerHand,
}) => {
  const [playerAddress, setPlayerAddress] = useState<Hex>();
  const [hand, setHand] = useState<readonly number[]>([]);
  
  const { data: playerState, refetch } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName:'getPlayerState',
    args: [BigInt(playerIndex)],
  });
  const { data: handValue } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName: 'calculateHandValue',
    args: [hand],
  });

  // every 5 seconds, fetch the player cards
  useEffect(() => {
    if (!isDealerHand) {
      const interval = setInterval(() => {
        void refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isDealerHand, refetch]);

  useEffect(() => {
    if (playerState && !isDealerHand) {
      setHand(playerState[2]);
      setPlayerAddress(playerState[0]);
      return;
    }
    if (dealerHand && isDealerHand) {
      setHand(dealerHand);
      setPlayerAddress(zeroAddress);
    }
  }, [dealerHand, isDealerHand, playerState]);

  console.log({
    playerAddress,
    hand,
    handValue,
  })

  if (playerAddress) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Avatar address={playerAddress} chain={base} />
          <Name address={playerAddress} chain={base}/>
          {isCurrentPlayer === playerIndex && (
            <div className="badge">Active</div>
          )}
        </div>
        <div className="flex flex-row gap-2">
          {hand.map((card, index) => (
            <div key={index}>
              {card.toLocaleString()}
            </div>
          ))}
          {handValue && (
            <div className="font-bold">
              {handValue.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default Hand;