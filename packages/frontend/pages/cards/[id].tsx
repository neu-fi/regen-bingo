import React from "react";
import { useRouter } from "next/router";
import { ICard } from "@/components/Card";

type CardProps = {};

function Cards(props: CardProps) {
  const router = useRouter();
  const { id } = router.query;
  const [card, setCard] = React.useState<ICard>();
  console.log(card);
  return <div>Card: {id}</div>;
}

export default Cards;
