import { type NextPage } from "next";
import dynamic from "next/dynamic";
const NoSSRBlackjack = dynamic(() => import('~/components/Blackjack'), { ssr: false });


export const Blackjack: NextPage = () => {
  return (
    <NoSSRBlackjack />
  )
};

export default Blackjack;
