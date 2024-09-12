import { type FC } from "react";
import { type Hex, parseEther, toFunctionSelector } from "viem";
import { useAccount } from "wagmi";
import { useGrantPermissions } from "wagmi/experimental";
import { createCredential } from "webauthn-p256";

import { BLACKJACK } from "~/constants/addresses";
import { usePermissions } from "~/contexts/PermissionsContext";

export const GrantPermissions: FC = () => {
  const { setPermissionsContext, setCredential } = usePermissions();

  const account = useAccount();
  const { grantPermissionsAsync, isPending } = useGrantPermissions();

  const grantPermissions = async () => {
    if (account.address) {
      try {
        const newCredential = await createCredential({ type: "cryptoKey" });
        const response = await grantPermissionsAsync({
          permissions: [
            {
              address: account.address,
              chainId: 84532,
              expiry: 17218875770,
              signer: {
                type: "key",
                data: {
                  type: "secp256r1",
                  publicKey: newCredential.publicKey,
                },
              },
              permissions: [
                {
                  type: "native-token-recurring-allowance",
                  data: {
                    allowance: parseEther("0.1"),
                    start: Math.floor(Date.now() / 1000),
                    period: 86400,
                  },
                },
                {
                  type: "allowed-contract-selector",
                  data: {
                    contract: BLACKJACK,
                    selector: toFunctionSelector(
                      "permissionedCall(bytes calldata call)",
                    ),
                  },
                },
              ],
            },
          ],
        });
        const context = response[0]!.context as Hex;
        console.log(context);
        setPermissionsContext(context);
        setCredential(newCredential);
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <button
      className="btn"
      onClick={() => {
        void grantPermissions();
      }}
      disabled={isPending}
    >
      {isPending && (
        <div className="loading loading-spinner" />
      )}
      Grant Permissions
    </button>
  );
};
