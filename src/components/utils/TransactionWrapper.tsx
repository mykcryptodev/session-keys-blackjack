import { useState } from 'react';
import { type ContractFunctionParameters, encodeFunctionData, type Hex } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useSendCalls } from 'wagmi/experimental';
import { signWithCredential } from 'webauthn-p256';

import { usePermissions } from '~/contexts/PermissionsContext';

interface TransactionWrapperProps {
  value?: bigint;
  contracts: ContractFunctionParameters[];
  buttonText: string;
  onSuccess?: () => void;
  className?: string;
}

export default function TransactionWrapper({ value, contracts, className, buttonText, onSuccess }: TransactionWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { sendCallsAsync } = useSendCalls();
  const { permissionsContext, credential } = usePermissions();

  const handleTransaction = async () => {
    setIsLoading(true);
    try {
      const calls = contracts.map(contract => encodeContractCall(contract, value ?? BigInt(0)))

      const transactionOptions = {
        chainId: baseSepolia.id,
        calls: calls,
        capabilities: {},
        signatureOverride: {},
      };

      console.log({ permissionsContext, credential, transactionOptions });

      // If we have permissionsContext and credential, use them for session key transaction
      if (permissionsContext && credential) {

        transactionOptions.calls = [encodeContractCall(contracts[0]!, value ?? BigInt(0))];
        transactionOptions.capabilities = {
          permissions: {
            context: permissionsContext,
          },
          paymasterService: {
            url: process.env.NEXT_PUBLIC_PAYMASTER_URL, // Make sure to set this in your .env file
          },
        };
        transactionOptions.signatureOverride = signWithCredential(credential);
      }

      // @ts-expect-error - sendCallsAsync does not like the tx options
      const result = await sendCallsAsync(transactionOptions);
      console.log('Transaction successful', result);
      if (onSuccess) {
        onSuccess(); // Call the onSuccess callback if provided
      }
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleTransaction}
      disabled={isLoading}
      className={`btn ${className}`}
    >
      {isLoading && (
        <div className="loading loading-spinner" />
      )}
      {buttonText}
    </button>
  );
}


function encodeContractCall(contract: ContractFunctionParameters, value: bigint)  {
  console.log({ contract, value: value.toString() });
  return {
    to: contract.address,
    data: encodeFunctionData({
      abi: contract.abi,
      functionName: contract.functionName,
      args: contract.args
    }),
    value: value ?? BigInt(0)
  };
}