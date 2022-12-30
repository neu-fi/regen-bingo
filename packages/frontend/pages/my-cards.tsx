import { PropsWithChildren } from "react";
import Head from "next/head";
import CardList from "@/components/CardList";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";

type MyCardsProps = {};

export default function MyCards(props: PropsWithChildren<MyCardsProps>) {
  const drawnNumbersList: ITableElement[] = [
    {
      drawnNumber: 1,
      timestamp: "2021-05-01T12:00:00Z",
      seed: "seedseedseedseedseedseedseedseed",
      txHash: "0x1234567890",
    },
    {
      drawnNumber: 2,
      timestamp: "2021-05-01T12:00:00Z",
      seed: "seed",
      txHash: "0x1234567890",
    },
  ];
  return (
    <>
      <Head>
        <title>My Cards</title>
      </Head>
      <div className="relative flex px-6 lg:px-8 justify-center">
        <div className="mx-auto max-w-max mt-10 pb-0">
          <div>
            <div className="row-span-full">
              <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                Your Cards
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                You can see your cards here and see if you win any of them!
              </p>
            </div>
            <div className="row-span-full mt-8">
              <div className="flex flex-wrap justify-center items-center flex-col ">
                <h3 className="text-xl font-bold text-violet-800 tracking-tight sm:text-center sm:text-xl">
                  Lucky Numbers
                </h3>
                <DrawnNumbersTable
                  drawnNumbers={drawnNumbersList}
                ></DrawnNumbersTable>
              </div>
            </div>
            <div className="row-span-full">
              <div className="flex flex-wrap flex-col justify-center items-center">
                <CardList drawnNumbers={drawnNumbersList}></CardList>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
