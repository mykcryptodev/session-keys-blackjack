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
import { useEffect } from 'react';
import { useAccount,useDisconnect } from "wagmi";

import usePrevious from '~/hooks/usePrevious';

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
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </WalletComponent>
      {address && (
        <>
          <WalletComponent>
            <WalletDropdown>
              <WalletDropdownFundLink />
              <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
                Wallet
              </WalletDropdownLink>
            </WalletDropdown>
          </WalletComponent>
        </>
      )}
    </div>
  );
}
