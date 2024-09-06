import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';
import {
  ConnectWallet,
  Wallet as WalletComponent,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { type Hex, parseEther, toFunctionSelector } from 'viem';
import { useAccount,useDisconnect } from "wagmi";
import { useGrantPermissions } from 'wagmi/experimental';
import { type P256Credential } from 'webauthn-p256';

import { SUPPORTED_CHAINS } from '~/constants';
import { usePermissions } from '~/contexts/PermissionsContext';
import usePrevious from '~/hooks/usePrevious';

type CreateCredentialFunction = (options: { type: 'cryptoKey' }) => Promise<{
  publicKey: Hex;
}>;
type Props = {
  btnLabel?: string;
  withWalletAggregator?: boolean;
}
export function Wallet({ btnLabel, withWalletAggregator }: Props) {
  const { address } = useAccount();
  const previousAddress = usePrevious(address);
  const { data: sessionData } = useSession();

  const { disconnectAsync } = useDisconnect();

  useEffect(() => {
    const addressWasChanged = previousAddress !== address;
    const userConnectedForFirstTime = previousAddress === undefined && address !== undefined;
    const userHasSession = sessionData?.user !== undefined;
    if (
      addressWasChanged && 
      !userConnectedForFirstTime && 
      userHasSession
    ) {
      void signOut();
    }
  }, [address, disconnectAsync, previousAddress, sessionData]);

  const { grantPermissionsAsync } = useGrantPermissions();
  const { permissionsContext, setPermissionsContext, setCredential } = usePermissions();

  const [createCredentialFunction, setCreateCredentialFunction] = useState<CreateCredentialFunction>();

  useEffect(() => {
    // Dynamically import createCredential
    import('webauthn-p256').then((module) => {
      setCreateCredentialFunction(() => module.createCredential as unknown as CreateCredentialFunction);
    }).catch(error => console.error('Failed to load createCredential:', error));
  }, []);

  const grantPermissions = async () => {
    if (address && typeof window !== 'undefined') {
      const newCredential = await createCredentialFunction!({ type: 'cryptoKey' });
      const response = await grantPermissionsAsync({
        permissions: [
          {
            address,
            chainId: SUPPORTED_CHAINS[0].id, // Base Sepolia
            expiry: Math.floor(Date.now() / 1000) + 31536000, // one year from now
            signer: {
              type: 'key',
              data: {
                type: 'secp256r1',
                publicKey: newCredential.publicKey,
              },
            },
            permissions: [
              {
                type: 'native-token-recurring-allowance',
                data: {
                  allowance: parseEther('0.1'),
                  start: Math.floor(Date.now() / 1000),
                  period: 86400,
                },
              },
              {
                type: 'allowed-contract-selector',
                data: {
                  contract: '0x244f5f7156Dcfc1eF0B214f91D1093741A6137dC',
                  selector: toFunctionSelector('permissionedCall(bytes calldata call)'),
                },
              },
            ],
          },
        ],
      });
      const context = response[0]!.context as Hex;
      setPermissionsContext(context);
      setCredential(newCredential as unknown as P256Credential<'cryptokey'>);
    }
  };

  console.log({ address, permissionsContext })

  return (
    <div className="flex gap-2 items-center">
      <WalletComponent>
        <ConnectWallet withWalletAggregator={withWalletAggregator} text={btnLabel}>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className={color.foregroundMuted} />
            <EthBalance />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownFundLink />
          {!permissionsContext && (
            <div>
              <button onClick={() => void grantPermissions()}>
                <WalletDropdownLink icon="wallet" href="#">
                  Grant Session Key Permissions
                </WalletDropdownLink>
              </button>
            </div>
          )}
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </WalletComponent>
    </div>
  );
}
