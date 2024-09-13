import { type LifeCycleStatus,TransactionToast, TransactionToastAction, TransactionToastIcon, TransactionToastLabel } from '@coinbase/onchainkit/transaction';
import { 
  Transaction, 
  TransactionButton,
  TransactionSponsor,
} from '@coinbase/onchainkit/transaction'; 
import { type FC,useState } from "react";
import { useCallback } from 'react';
import { baseSepolia } from "wagmi/chains";

import TransactionWrapper from '~/components/utils/TransactionWrapper';
import { abi as blackjackAbi } from "~/constants/abi/blackjack";
import { BLACKJACK } from "~/constants/addresses";

type Props = {
  btnLabel: string;
  loadingLabel?: string;
  functionName: string;
  args?: unknown[];
  value?: bigint;
  onActionSuccess?: () => void;
}
export const Action: FC<Props> = ({ btnLabel, loadingLabel, functionName, args, value, onActionSuccess }) => {
  const [key, setKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleOnStatus = useCallback((status: LifeCycleStatus) => {
    if (status.statusName === 'success') {
      setIsLoading(true);
      onActionSuccess?.();
      setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 3000);
    }
    if (status.statusName === "error") {
      console.log('Transaction error');
      setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 3000);
    }
  }, [onActionSuccess]);

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex w-full items-center gap-2">
        <TransactionWrapper
          contracts={[{
            address: BLACKJACK,
            abi: blackjackAbi,
            functionName,
            args,
          }]}
          value={value}
          buttonText={`${btnLabel} 🔑`}
          className="mt-4 w-1/2 text-base"
          onSuccess={() => setIsLoading(true)}
        />
        <Transaction
          key={key}
          chainId={baseSepolia.id}
          contracts={[{
            address: BLACKJACK,
            abi: blackjackAbi,
            functionName,
            args,
          }]}
          onStatus={handleOnStatus}
        >
          <TransactionButton text={`${btnLabel} ✍️`} />
          <TransactionSponsor />
          <TransactionToast>
            <TransactionToastIcon />
            <TransactionToastLabel />
            <TransactionToastAction />
          </TransactionToast>
        </Transaction>
      </div>
      {isLoading && (
        <div className="flex items-end justify-center w-full gap-0.5">
          <span className="font-bold">{loadingLabel ?? "Actioning"}</span>
          <span className="loading loading-dots loading-xs"></span>
        </div>
      )}
    </div>
  );
};

export default Action;

