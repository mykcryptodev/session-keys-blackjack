import { type FC } from "react";
import { type ContractFunctionParameters, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import { abi, abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

import TransactionWrapper from "../utils/TransactionWrapper";

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

  const contracts: ContractFunctionParameters[] = [
    {
      address: BLACKJACK,
      abi,
      functionName: 'joinGame',
      args: [],
    },
  ];

  return (
    <div className="flex w-full items-center gap-2">
      <TransactionWrapper
        contracts={contracts}
        buttonText="Place Bet 🔑"
        value={parseEther('0.0000001')}
        onSuccess={() => console.log('transaction success')}
        className="w-1/2"
      />
      <button
        onClick={() => {
          void handleJoinGame();
        }}
        disabled={isPending}
        className="btn btn-primary w-1/2"
      >
        {isPending && (
          <div className="loading loading-spinner" />
        )}
        Place Bet ✍️
      </button>
    </div>
  );
};

export default Bet;