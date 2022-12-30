import { PropsWithChildren } from "react";
import Card, { ICard } from "@/components/Card";
import { ITableElement } from "@/components/DrawnNumbersTable";
import Image from "next/image";
import { svg } from "@/utils/utils";
type CardListProps = {
  drawnNumbers: ITableElement[];
};

const people = [
  {
    name: "Leslie Alexander",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    bio: "Ultricies massa malesuada viverra cras lobortis. Tempor orci hac ligula dapibus mauris sit ut eu. Eget turpis urna maecenas cras. Nisl dictum.",
    twitterUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Leslie Alexander",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    bio: "Ultricies massa malesuada viverra cras lobortis. Tempor orci hac ligula dapibus mauris sit ut eu. Eget turpis urna maecenas cras. Nisl dictum.",
    twitterUrl: "#",
    linkedinUrl: "#",
  },
  // More people...
];

const cards: ICard[] = [
  {
    id: 1,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 21],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
  {
    id: 2,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
  {
    id: 3,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
  {
    id: 4,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
  {
    id: 5,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
  {
    id: 6,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    image: svg,
    hash: "0xd2ff891f5556c623f36a3f22b0e4815a3e36dc23/22",
  },
];

export default function CardList(props: PropsWithChildren<CardListProps>) {
  const drawnNumbersInt: number[] = props.drawnNumbers.map(
    (number) => number.drawnNumber
  );

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
                  <Card card={card} drawnNumbers={drawnNumbersInt}></Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
