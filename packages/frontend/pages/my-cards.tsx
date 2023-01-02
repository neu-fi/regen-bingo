import { PropsWithChildren, useState } from "react";
import Head from "next/head";
import CardList from "@/components/CardList";
import { GetDrawnNumbers } from "@/components/contract/GetDrawnNumbers";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";

type MyCardsProps = {};

export default function MyCards(props: PropsWithChildren<MyCardsProps>) {
  const [drawnNumbersList, setDrawnNumbersList] = useState<ITableElement[]>([]);

  return (
    <>
      <Head>
        <title>My Cards</title>
      </Head>
      <div className="relative flex px-6 lg:px-8 justify-center">
        <div className="max-w-full mt-10 pb-0 flex justify-center">
          <div>
            <div className="row-span-full">
              <MyCardsHeader></MyCardsHeader>
            </div>
            <div className="row-span-full mt-8">
              <LuckyNumbers
                setDrawnNumbersList={setDrawnNumbersList}
              ></LuckyNumbers>
            </div>
            <div className="row-span-full mt-4">
              <div className="flex flex-col justify-center items-stretch flex-nowrap">
                <CardList drawnNumbers={drawnNumbersList}></CardList>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LuckyNumbers(props: {
  setDrawnNumbersList: (drawnNumbers: ITableElement[]) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center items-center flex-col ">
      <h3 className="text-xl font-bold text-green-4 tracking-tight sm:text-center sm:text-xl">
        Lucky Numbers
      </h3>
      <GetDrawnNumbers
        onDrawnNumbersUpdate={props.setDrawnNumbersList}
      ></GetDrawnNumbers>
    </div>
  );
}

function MyCardsHeader() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
        My Cards
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
        You can see your Regen Bingo Card NFTs here and watch them as the numbers are drawn!
      </p>
    </div>
  );
}
