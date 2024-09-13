import { Avatar, Name } from "@coinbase/onchainkit/identity";
import type { LifeCycleStatus } from '@coinbase/onchainkit/transaction'; 
import { Transaction, TransactionButton, TransactionSponsor, TransactionToast, TransactionToastAction, TransactionToastIcon, TransactionToastLabel } from "@coinbase/onchainkit/transaction";
import type { NextPage } from "next";
import { type FC, useCallback, useEffect,useState } from "react";
import { erc721Abi, isAddressEqual } from "viem";
import { base } from "viem/chains";
import { useAccount, useReadContract } from "wagmi";

import Card from "~/components/Blackjack/Card";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK, CARD_NFT } from "~/constants/addresses";
import { tokenIdToCard } from "~/constants/cards";

export const Cards: NextPage = () => {
  const { address } = useAccount();
  const { data: fids, refetch } = useReadContract({
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
    const handleOnStatus = useCallback((status: LifeCycleStatus) => { 
      console.log('LifecycleStatus', status); 
      if (status.statusName === "success") {
        void refetch();
      }
    }, []);
    const { data: ownerAddress } = useReadContract({
      address: CARD_NFT,
      abi: erc721Abi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });
    const [fid, setFid] = useState<string | undefined>();
    const [newFid, setNewFid] = useState<string>();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    useEffect(() => {
      // @ts-expect-error - TS doesn't like us
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
      <div className="flex max-w-xs my-8 items-center gap-2 w-full">
        {/* @ts-expect-error - TS doesn't like us */}
        <Card value={tokenIdToCard[tokenId]?.value} suit={tokenIdToCard[tokenId]?.suit} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar address={ownerAddress} chain={base} />
            <Name address={ownerAddress} chain={base} />
          </div>
          <input
            className="w-full input input-sm input-bordered text-center"
            type="text"
            value={newFid}
            placeholder={fid}
            onChange={(e) => setNewFid(e.target.value)}
          />
          {address && isAddressEqual(ownerAddress, address) && (
            <Transaction
              contracts={[{
                address: BLACKJACK,
                abi,
                functionName: "updateCardFid",
                args: [BigInt(tokenId), BigInt(newFid ?? 0)],
              }]}
              onStatus={handleOnStatus}
              className="max-h-10"
            >
              <TransactionButton text="Update FID" />
              <TransactionSponsor />
              <TransactionToast>
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction> 
          )}
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