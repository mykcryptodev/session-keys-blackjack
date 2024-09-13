import { Avatar, Name } from "@coinbase/onchainkit/identity";
import type { NextPage } from "next";
import { type FC, useEffect,useState } from "react";
import { erc721Abi } from "viem";
import { base } from "viem/chains";
import { useReadContract } from "wagmi";

import Card from "~/components/Blackjack/Card";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK, CARD_NFT } from "~/constants/addresses";
import { tokenIdToCard } from "~/constants/cards";

export const Cards: NextPage = () => {
  const { data: fids } = useReadContract({
    address: BLACKJACK,
    abi,
    functionName: "getAllCardFids",
  });

  // Function to find FID for a given value/suit combination
  const findFid = (value: number, suit: number): string | undefined => {
    if (!fids || fids.length !== 3) return undefined;
    const [values, suits, fidArray] = fids;
    const index = values.findIndex((v, i) => v === value && suits[i] === suit);
    return index !== -1 ? fidArray[index]!.toString() : undefined;
  };

  const NftCard: FC<{ tokenId: string }> = ({ tokenId }) => {
    const { data: ownerAddress } = useReadContract({
      address: CARD_NFT,
      abi: erc721Abi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });
    const [fid, setFid] = useState<string | undefined>();

    useEffect(() => {
      const card = tokenIdToCard[tokenId];
      if (card) {
        const foundFid = findFid(card.value, card.suit);
        setFid(foundFid);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenId, fids]);

    console.log({ fid });

    if (!ownerAddress) return null;
    return (
      <div className="flex max-w-xs items-center gap-2 w-full">
        <Card
          value={tokenIdToCard[tokenId]?.value}
          suit={tokenIdToCard[tokenId]?.suit}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar address={ownerAddress} chain={base} />
            <Name address={ownerAddress} chain={base} />
          </div>
          <input
            className="w-full input input-bordered"
            type="text"
            value={fid}
            onChange={(e) => setFid(e.target.value)}
            readOnly
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {Object.keys(tokenIdToCard).map((tokenId) => {
        return (
          <NftCard 
            key={tokenId} 
            tokenId={tokenId}
          />
        );
      })}
    </div>
  );
};

export default Cards;