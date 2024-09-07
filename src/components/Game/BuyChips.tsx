import { type FC } from "react";

import { api } from "~/utils/api";

type Props = {
  id: string;
}
export const BuyChips: FC<Props> = ({ id }) => {
  const { mutateAsync: buyChips, isPending } = api.game.buyChips.useMutation();

  const handleBuyChips = async () => {
    await buyChips({
      amount: 1000,
    });
  }

  return (
    <button 
      className="btn"
      onClick={handleBuyChips}
      disabled={isPending}
    >
      {isPending && (
        <div className="loading loading-spinner" />
      )}
      Buy Chips
    </button>
  );
}

export default BuyChips;