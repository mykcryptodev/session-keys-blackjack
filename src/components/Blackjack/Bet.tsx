import Image from "next/image";
import { type FC, useEffect,useState } from "react";
import { type ContractFunctionParameters, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import { abi, abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

import TransactionWrapper from "../utils/TransactionWrapper";

type Props = {
  onGameJoined?: () => void;
}
const MIN_BET = "0.0000001";
const MAX_BET = "0.1";

export const Bet: FC<Props> = ({ onGameJoined }) => {
  const { writeContractAsync, isPending } = useWriteContract();
  const [amount, setAmount] = useState<string>(MIN_BET);
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleJoinGame = async () => {
    try {
      const tx = await writeContractAsync({
        address: BLACKJACK,
        chainId: baseSepolia.id,
        abi: blackjackAbi,
        functionName: 'joinGame',
        args: [],
        value: parseEther(amount),
      });
      console.log({tx});
      setIsLoading(true);
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

  const handleAmountChange = (value: string) => {
    // Allow empty string for easier editing
    if (value === '') {
      setAmount('');
      return;
    }

    // Remove any non-digit or non-decimal point characters
    value = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 7 decimal places
    if (parts[1] && parts[1].length > 7) {
      value = parts[0] + '.' + parts[1].slice(0, 7);
    }

    setAmount(value);
  };

  useEffect(() => {
    const numValue = parseFloat(amount);
    setIsValidAmount(!isNaN(numValue) && numValue >= parseFloat(MIN_BET) && numValue <= parseFloat(MAX_BET));
  }, [amount]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex sm:flex-row flex-col w-full items-start gap-2">
        <div className="relative grow sm:w-fit w-full">
          <button 
            className="btn btn-outline btn-xs absolute left-3 top-3"
            onClick={() => setAmount(MIN_BET)}
          >
            Min
          </button>
          <button 
            className="btn btn-outline btn-xs absolute left-14 top-3"
            onClick={() => setAmount(MAX_BET)}
          >
            Max
          </button>
          <input 
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="input input-bordered text-right pr-12 w-full"
          />
          <Image 
            src="https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png"
            alt="ETH"
            width={24}
            height={24}
            className="absolute right-3 top-3"
          />
          {!isValidAmount && (
            <span className="text-xs text-error">Max: {MIN_BET} Min: {MAX_BET}</span>
          )}
        </div>
        <TransactionWrapper
          contracts={contracts}
          buttonText="Place Bet 🔑"
          value={parseEther(amount || '0')}
          isDisabled={isPending || !isValidAmount}
          onSuccess={() => setIsLoading(true)}
          className="grow sm:w-fit w-full"
        />
        <button
          onClick={() => {
            void handleJoinGame();
          }}
          disabled={isPending || !isValidAmount}
          className="btn btn-primary grow sm:w-fit w-full"
        >
          {isPending && (
            <div className="loading loading-spinner" />
          )}
          Place Bet ✍️
        </button>
      </div>
      {isLoading && (
        <div className="flex items-end justify-center w-full gap-0.5">
          <span className="font-bold">Placing Bet</span>
          <span className="loading loading-dots loading-xs"></span>
        </div>
      )}
    </div>
  );
};

export default Bet;