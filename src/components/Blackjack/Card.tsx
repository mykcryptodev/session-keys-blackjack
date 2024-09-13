import Image from "next/image";
import { type FC } from "react";
import { useReadContract } from "wagmi";

import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";
import { DEFAULT_CARD_FIDS } from "~/constants/cards";

type Props = {
  suit: number;
  value: number;
}

export const Card: FC<Props> = ({ suit, value }) => {
  const { data: fid } = useReadContract({
    address: BLACKJACK,
    abi,
    functionName: "getCardFid",
    args: [value, suit],
  });

  const suitLetter = ['H', 'D', 'C', 'S'][suit]!;
  const cardValue = value === 1 ? 'A' : value === 11 ? 'J' : value === 12 ? 'Q' : value === 13 ? 'K' : value.toString();

  const url = `https://far.cards/api/deck/${suitLetter}/${cardValue}/${fid ? fid : DEFAULT_CARD_FIDS[suitLetter]![cardValue]}`;

  return (
    <Image
      src={url}
      alt={`Card: ${cardValue} of ${suitLetter}`}
      width={100}
      height={150}
    />
  )
};

export default Card;