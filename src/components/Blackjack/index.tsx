import { useSnackbar } from 'notistack';
import { type FC, useEffect, useMemo, useState } from 'react';
import { formatEther, isAddressEqual, zeroAddress } from 'viem';
import { useAccount, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import Action from "~/components/Blackjack/Action";
import Bet from "~/components/Blackjack/Bet";
import Hand from "~/components/Blackjack/Hand";
import { Watch } from "~/components/Blackjack/Watch";
import { GrantPermissions } from "~/components/Wallet/GrantPermissions";
import { abi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";
import calculateHandValue from "~/helpers/calculateHandValue";

export const Blackjack: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
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

  const userWinnings = useMemo(() => {
    if (!data?.dealerHasPlayed || !address) return "0";
    // check if the user has busted
    const userPlayerIndex = data.playerAddresses.findIndex(playerAddress => isAddressEqual(playerAddress, address));
    if (!data.playerHandValues[userPlayerIndex]) return "0";
    
    const userHandValue = calculateHandValue(data.playerHandValues[userPlayerIndex]);
    if (userHandValue > 21) return "0";
    
    const winnings = data.playerAddresses.reduce((acc, playerAddress, index) => {
      if (isAddressEqual(playerAddress, address)) {
        return acc + data.playerBets[index]!;
      }
      return acc - data.playerBets[index]!;
    }, BigInt(0));

    // check if the dealer has busted
    const dealerHandValue = calculateHandValue(data.dealerHandValues);
    if (dealerHandValue > 21) return formatEther(winnings);

    console.log({ userHandValue, dealerHandValue });
    
    // check if the user has a higher hand value
    if (userHandValue > dealerHandValue) {
      return formatEther(winnings);
    };

    return "0";
  }, [address, data?.dealerHandValues, data?.dealerHasPlayed, data?.playerAddresses, data?.playerBets, data?.playerHandValues]);

  useEffect(() => {
    if (userWinnings !== "0") {
      console.log("User is winner!");
      enqueueSnackbar(`🎉 You won ${userWinnings} ETH!`, { variant: 'success' });
    }
  }, [enqueueSnackbar, userWinnings]);

  // every 5 seconds, refetch the game state
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const [showTip, setShowTip] = useState<boolean>(true);

  if (!data) return null;
  return (
    <div className="flex flex-col gap-2">
      <Watch onEvent={() => void refetch()} />
      <GrantPermissions />
      {showTip && (
        <div className="border rounded-lg sm:p-4 p-2 text-center relative">
          <button
            className="absolute top-0 right-2 p-2"
            onClick={() => setShowTip(false)}
          >&times;</button>
          If 🔑 buttons stop working, try granting permissions again
        </div>
      )}
      {!userIsPlayingInGame && (
        <Bet onGameJoined={refetch} />
      )}
      {userIsPlayingInGame && !data.isActive && (
        <Action btnLabel="Deal" loadingLabel="Dealing" functionName="startDealing" onActionSuccess={refetch} />
      )}
      {userIsPlayingInGame && data.isActive && data.currentPlayerIndex === userPlayerIndex && (
        <div className="flex sm:flex-row flex-col w-full items-start sm:gap-2 gap-0" key={data.lastActionTimestamp}>
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
      <div className="py-2" />
      {data.playerAddresses.concat(zeroAddress).map((player, index) => (
        <Hand 
          key={player} 
          numPlayers={data.playerAddresses.length}
          playerIndex={index} 
          currentPlayerIndex={data.currentPlayerIndex}
          isDealerHand={index === data.playerAddresses.length}
          dealerHandValues={data.dealerHandValues}
          dealerHandSuits={data.dealerHandSuits}
          lastActionTimestamp={data.lastActionTimestamp}
        />
      ))}
    </div>
  );
};

export default Blackjack;