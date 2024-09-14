import { Avatar, Name } from "@coinbase/onchainkit/identity";
import Image from "next/image";
import { type FC, useEffect, useState } from "react";
import { type Hex, isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

import Action from "~/components/Blackjack/Action";
import Card from "~/components/Blackjack/Card";
import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  playerIndex: number;
  currentPlayerIndex: number;
  numPlayers: number;
  isDealerHand: boolean;
  dealerHandValues?: readonly number[];
  dealerHandSuits?: readonly number[];
  lastActionTimestamp?: bigint;
};

export const Hand: FC<Props> = ({ 
  playerIndex,
  currentPlayerIndex,
  isDealerHand,
  dealerHandValues,
  dealerHandSuits,
  numPlayers,
  lastActionTimestamp,
}) => {
  const { address } = useAccount();
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

  console.log({
    dateNow: Date.now() / 1000,
    lastActionTimestamp: lastActionTimestamp ? Number(lastActionTimestamp) : null,
    diff: lastActionTimestamp ? (Date.now() / 1000 - Number(lastActionTimestamp)) : null,
  })
  const [lastActionWasTooLongAgo, setLastActionWasTooLongAgo] = useState<boolean>(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const wasTooLong = Boolean(lastActionTimestamp && (Date.now() / 1000 - Number(lastActionTimestamp)) > 60);
      if (wasTooLong) {
        setLastActionWasTooLongAgo(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActionTimestamp]);

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
          {isAddressEqual(playerAddress, zeroAddress) ? (
            <div className="font-bold">Dealer</div>
          ) : (
            <Name address={playerAddress} chain={base}/>
          )}
          {currentPlayerIndex === playerIndex && numPlayers > 0 && (
            <div className="badge">Active</div>
          )}
          {handValue ? (
            <div className="font-bold">
              {handValue.toString()}
            </div>
          ) : (null)}
        </div>
        <div className="flex flex-row gap-2">
          {handValues.filter(v => v).map((value, index) => (
            <div key={index}>
              <Card
                value={value}
                suit={handSuits[index]!}
              />
              <span className="sr-only">
                {`${value}${getSuitSymbol(handSuits[index])}`}
              </span>
            </div>
          ))}
          {handValues.length === 1 && (
            <Image
              src="/images/logo.png"
              alt="Card back"
              width={80}
              height={140}
              className="w-32 mt-1 -mx-3"
            />
          )}
        </div>
        {!isDealerHand && currentPlayerIndex === playerIndex && address && isAddressEqual(playerAddress, address) && lastActionWasTooLongAgo && (
          <div className="flex flex-col items-center p-4 sm:p-8 border rounded-lg">
            <div className="flex flex-col text-center">
              <div className="font-bold">Time is up</div>
              <div className="text-sm">Other players can force you to stand! Hurry up!</div>
            </div>
          </div>
        )}
        {!isDealerHand && currentPlayerIndex === playerIndex && lastActionWasTooLongAgo && address && !isAddressEqual(playerAddress, address) && (
          <div className="flex flex-col items-center p-4 sm:p-8 border rounded-lg">
            <div className="flex flex-col text-center">
              <div className="font-bold">Time is up!</div>
              <div className="text-sm">You can force the player to stand to keep the game moving</div>
            </div>
            <Action
              btnLabel="Force Stand"
              loadingLabel="Forcing Stand"
              functionName="forceStand"
              args={[BigInt(playerIndex)]}
              onActionSuccess={refetch}
            />
          </div>
        )}
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