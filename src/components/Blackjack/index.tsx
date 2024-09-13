import { type FC, useEffect, useMemo } from 'react';
import { isAddressEqual, zeroAddress } from 'viem';
import { useAccount, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import Action from "~/components/Blackjack/Action";
import Bet from "~/components/Blackjack/Bet";
import Hand from "~/components/Blackjack/Hand";
import { Watch } from "~/components/Blackjack/Watch";
import { GrantPermissions } from "~/components/Wallet/GrantPermissions";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

export const Blackjack: FC = () => {
  const { address } = useAccount();

  const { 
    data,
    refetch,
  } = useReadContract({ 
    address: BLACKJACK, 
    chainId: baseSepolia.id,
    abi,
    functionName: 'getGameState',
  });
  console.log({ data });

  const userIsPlayingInGame = useMemo(() => {
    if (!address || !data?.playerAddresses) return false;
    return data.playerAddresses.some(playerAddress => isAddressEqual(playerAddress, address));
  }, [address, data?.playerAddresses]);

  const userPlayerIndex = useMemo(() => {
    if (!address || !data?.playerAddresses) return -1;
    return data.playerAddresses.findIndex(playerAddress => isAddressEqual(playerAddress, address));
  }, [address, data?.playerAddresses]);

  const dealerIsCurrentPlayer = useMemo(() => {
    return data?.currentPlayerIndex === data?.playerAddresses.length;
  }, [data?.currentPlayerIndex, data?.playerAddresses]);

  // every 5 seconds, refetch the game state
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!data) return null;
  return (
    <div className="flex flex-col gap-2">
      <Watch onEvent={() => void refetch()} />
      <GrantPermissions />
      {!userIsPlayingInGame && (
        <Bet onGameJoined={refetch} />
      )}
      {userIsPlayingInGame && !data.isActive && (
        <Action btnLabel="Deal" loadingLabel="Dealing" functionName="startDealing" onActionSuccess={refetch} />
      )}
      {userIsPlayingInGame && data.isActive && data.currentPlayerIndex === userPlayerIndex && (
        <div className="flex w-full items-start gap-2" key={data.lastActionTimestamp}>
          <Action btnLabel="Stand" loadingLabel="Standing" functionName="stand" onActionSuccess={refetch} />
          <Action btnLabel="Hit" loadingLabel="Hitting" functionName="hit" onActionSuccess={refetch} />
        </div>
      )}
      {dealerIsCurrentPlayer && data.playerAddresses.length > 0 && (
        <Action btnLabel="Play Dealer" loadingLabel="Playing Dealer" functionName="playDealer" onActionSuccess={refetch} />
      )}
      {data.isActive && data.dealerHasPlayed && (
        <Action btnLabel="Settle Game" loadingLabel="Settling Game" functionName="settleGame" onActionSuccess={refetch} />
      )}
      {data.playerAddresses.concat(zeroAddress).map((player, index) => (
        <Hand 
          key={player} 
          playerIndex={index} 
          isCurrentPlayer={data.currentPlayerIndex}
          isDealerHand={index === data.playerAddresses.length}
          dealerHandValues={data.dealerHandValues}
          dealerHandSuits={data.dealerHandSuits}
        />
      ))}
    </div>
  );
};

export default Blackjack;