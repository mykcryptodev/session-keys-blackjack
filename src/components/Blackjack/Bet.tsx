import { type FC } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  onGameJoined?: () => void;
}
export const Bet: FC<Props> = ({ onGameJoined }) => {
  const { writeContractAsync, isPending } = useWriteContract();
  const handleJoinGame = async () => {
    console.log('join game');
    try {
      const tx = await writeContractAsync({
        address: BLACKJACK,
        chainId: baseSepolia.id,
        abi: blackjackAbi,
        functionName: 'joinGame',
        args: [],
        value: parseEther('0.0000001'),
      });
      console.log({tx});
      onGameJoined?.();
    } catch (e) {
      console.log({e});
    }
  };

  return (
    <button
      onClick={() => {
        void handleJoinGame();
      }}
      disabled={isPending}
      className="btn btn-primary"
    >
      {isPending && (
        <div className="loading loading-spinner" />
      )}
      Place Bet
    </button>
  );
};

export default Bet;
