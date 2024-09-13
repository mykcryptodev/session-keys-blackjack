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
  functionName: string;
  args?: unknown[];
  value?: bigint;
  onActionSuccess?: () => void;
}
export const Action: FC<Props> = ({ btnLabel, functionName, args, value, onActionSuccess }) => {
  const [key, setKey] = useState<number>(0);
  const handleOnStatus = useCallback((status: LifeCycleStatus) => {
    console.log('LifecycleStatus', status);
    if (status.statusName === 'success') {
      console.log('Transaction success');
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
        onSuccess={() => console.log('transaction success')}
        className="mt-4 w-1/2 text-base"
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
  );
};

export default Action;

