import { type NextPage } from "next";

import Card from "~/components/Blackjack/Card";
import { tokenIdToCard } from "~/constants/cards";

export const Cards: NextPage = () => {
  return (
    <div>
      {Object.keys(tokenIdToCard).map((tokenId) => {
        return (
          <div key={tokenId} className="flex items-center justify-between gap-2 w-full">
            <Card
              value={tokenIdToCard[tokenId].value}
              suit={tokenIdToCard[tokenId].suit}
            />
          </div>
        );
      }
      )}
    </div>
  )
};

export default Cards;