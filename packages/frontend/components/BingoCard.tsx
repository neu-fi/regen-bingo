import React, { useState } from "react";
import Image from "next/image";

// import ReactLogo from "../public/bingo-card.svg";

type BingoCardProps = {
  bingoCardId?: number;
};

interface ICard {
  id: number;
  numbers: ICardNumber[];
}

interface ICardNumber {
  id: number;
  value: number;
  visible: boolean;
}

/* 
  TODO: BingoCard component
  We will use this component to display cards 
  for the bingo game. Everything related to bingo card
  will be in this component. This includes the numbers 
  hidden or visible, the bingo card itself. 
*/
function BingoCard(props: BingoCardProps) {
  const { bingoCardId } = props;
  const [bingoCard, setBingoCard] = useState<ICard | null>(null);
  return (
    <>
      <Image
        className="backdrop-blur-lg"
        src="bingo-card.svg"
        height={"400"}
        width={"400"}
        alt=""
      />
    </>
  );
}

export default BingoCard;
