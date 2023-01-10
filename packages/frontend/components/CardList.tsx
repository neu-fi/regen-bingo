import Card, { ICard } from "@/components/Card";
import { ITableElement } from "@/components/DrawnNumbersTable";
import { svg } from "@/utils/utils";
import { PropsWithChildren, useEffect, useState } from "react";

type CardListProps = {};

const dummyCards: ICard[] = [
  {
    id: "0x36e1de2f4233ee543dc7e5670f9df61d997b5d648be5c4d8e36cf73edf0e46ea",
    coveredNumbersCount: 0,
    tokenURI: {
      name: "asd",
      image: svg,
      description: "...",
    },
  },
  {
    id: "0x36e1de2f4233ee543dc7e5670f9df61d997b5d648be5c4d8e36cf73edf0e46ea",
    coveredNumbersCount: 3,
    tokenURI: {
      name: "asd",
      image: svg,
      description: "...",
    },
  },
  {
    id: "0x36e1de2f4233ee543dc7e5670f9df61d997b5d648be5c4d8e36cf73edf0e46ea",
    coveredNumbersCount: 3,
    tokenURI: {
      name: "asd",
      image: svg,
      description: "...",
    },
  },
];

type SortType = {
  sort: "asc" | "desc";
  key: "matches" | "id";
};

export function sortCards(
  cards: ICard[],
  type: SortType = { sort: "desc", key: "matches" }
): ICard[] {
  if (type.key === "matches") {
    // SORT BY MATCHES
    return cards.sort((a, b) => {
      const aMatches = a.coveredNumbersCount;
      const bMatches = b.coveredNumbersCount;
      return type.sort === "asc" ? aMatches - bMatches : bMatches - aMatches;
    });
  }
  return cards;
}

export default function CardList(props: PropsWithChildren<CardListProps>) {
  const [cards, setCards] = useState<ICard[]>(dummyCards);
  const [sort, setSort] = useState<SortType>({ sort: "desc", key: "matches" });

  useEffect(() => {
    const fetchDrawnNumbers = async () => {
      // TODO: Fetch cards from the contract
      // const drawnNumbers = await contract.getDrawnNumbers();
      setCards(sortCards(cards, sort));
    };
    fetchDrawnNumbers();
  }, [sort]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl my-4">
      <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
        <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          <div className="lg:col-span-2">
            <ul
              role="list"
              className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0"
            >
              {cards.map((card) => (
                <li key={card.id} className="sm:py-4">
                  <Card card={card}></Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
