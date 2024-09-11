import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { type FC,useEffect } from "react";
import { useReadContract } from "wagmi";
import { base,baseSepolia } from "wagmi/chains";

import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  playerIndex: number;
  refetchTimestamp?: number;
  isCurrentPlayer: number;
}
export const Hand: FC<Props> = ({ playerIndex, refetchTimestamp, isCurrentPlayer }) => {
  const { data, isPending, refetch } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName: 'getPlayerState',
    args: [BigInt(playerIndex)],
  });
  const { data: cards } = useReadContract({
    address: BLACKJACK,
    chainId: baseSepolia.id,
    abi: blackjackAbi,
    functionName: 'calculateHandValue',
    args: [data?.[2] as number[]],
  });
  
  useEffect(() => {
    if (refetchTimestamp) {
      void refetch();
    }
  }, [refetch, refetchTimestamp]);

  // every 5 seconds, fetch the cards
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (data) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Avatar address={data[0]} chain={base} />
          <Name address={data[0]} chain={base}/>
          {isCurrentPlayer === playerIndex && (
            <div className="badge">Active</div>
          )}
        </div>
        <div className="flex flex-row gap-2">
          {data[2].map((card, index) => (
            <div key={index}>
              {card.toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default Hand;