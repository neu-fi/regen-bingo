import React from "react";
import { ICard, Card } from "@/components/Card";

type CardListProps = {};

function CardList(props: CardListProps) {
  const cards: ICard[] = [
    {
      id: 1,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
    {
      id: 2,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
    {
      id: 3,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
    {
      id: 4,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
    {
      id: 5,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
    {
      id: 6,
      numbers: [1, 2, 3, 4, 5],
      image:
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
    },
  ];
  return (
    <>
      {cards.map((card) => (
        <div className="flex my-2">
          <Card card={card}></Card>
        </div>
      ))}
    </>
  );
}

export default CardList;
