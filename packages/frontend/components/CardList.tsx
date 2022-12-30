import React from "react";
import { ICard, Card } from "@/components/Card";
import { ITableElement } from "./DrawnNumbersTable";

type CardListProps = {
  drawnNumbers: ITableElement[];
};

function CardList(props: CardListProps) {
  const cards: ICard[] = [
    {
      id: 1,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
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

  const drawnNumbersInt = props.drawnNumbers.map(
    (number) => number.drawnNumber
  );
  return (
    <div className="flex justify-center items-center flex-col">
      {cards.map((card) => (
        <div className="flex justify-center items-center my-2 flex-col lg:min-w-2xl">
          <Card card={card} drawnNumbers={drawnNumbersInt}></Card>
        </div>
      ))}
    </div>
  );
}

export default CardList;
