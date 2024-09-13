import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { type FC, useEffect, useState } from "react";
import { type Hex, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

import Card from "~/components/Blackjack/Card";
import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  playerIndex: number;
  isCurrentPlayer: number;
  isDealerHand: boolean;
  dealerHandValues?: readonly number[];
  dealerHandSuits?: readonly number[];
};

export const Hand: FC<Props> = ({ 
  playerIndex,
  isCurrentPlayer,
  isDealerHand,
  dealerHandValues,
  dealerHandSuits,
}) => {
  const [playerAddress, setPlayerAddress] = useState<Hex>();
  const [handValues, setHandValues] = useState<readonly number[]>([]);
  const [handSuits, setHandSuits] = useState<readonly number[]>([]);

  const { data: playerState, refetch } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName: 'getPlayerState',
    args: [BigInt(playerIndex)],
  });

  const { data: handValue } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName: 'calculateHandValue',
    args: [
      // @ts-expect-error - TS doesn't like the array length
      Array.from({ length: 21 }, (_, i) => {
        const value = handValues[i] ?? 0;
        const suit = handSuits[i] ?? 0;
        return { value, suit };
      }),
      handValues.length,
    ],
  });

  console.log({ handValue });

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
      setHandValues(playerState[2].slice(0, playerState[3]).map(card => card.value));
      setHandSuits(playerState[2].slice(0, playerState[3]).map(card => card.suit));
      setPlayerAddress(playerState[0]);
    } else if (dealerHandValues && dealerHandSuits && isDealerHand) {
      setHandValues(dealerHandValues);
      setHandSuits(dealerHandSuits);
      setPlayerAddress(zeroAddress);
    }
  }, [dealerHandValues, dealerHandSuits, isDealerHand, playerState]);

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
          {handValues.filter(v => v).map((value, index) => (
            <div key={index}>
              <Card
                value={value}
                suit={handSuits[index]!}
              />
              {`${value}${getSuitSymbol(handSuits[index])}`}
            </div>
          ))}
          {handValue && (
            <div className="font-bold">
              {handValue.toString()}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

function getSuitSymbol(suit: number | undefined): string {
  switch (suit) {
    case 0: return "♥"; // Hearts
    case 1: return "♦"; // Diamonds
    case 2: return "♣"; // Clubs
    case 3: return "♠"; // Spades
    default: return "?"; // Unknown
  }
}

export default Hand;