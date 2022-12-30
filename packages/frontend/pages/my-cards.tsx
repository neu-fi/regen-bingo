import { PropsWithChildren, useState } from "react";
import Head from "next/head";
import CardList from "@/components/CardList";
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
        <div className="max-w-full min-w-full mt-10 pb-0 flex justify-center">
          <div>
            <div className="row-span-full">
              <MyCardsHeader></MyCardsHeader>
            </div>
            <div className="row-span-full mt-8">
              <LuckyNumbers
                setDrawnNumbersList={setDrawnNumbersList}
                drawnNumbersList={drawnNumbersList}
              ></LuckyNumbers>
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

function LuckyNumbers(props: {
  drawnNumbersList: ITableElement[];
  setDrawnNumbersList: (drawnNumbers: ITableElement[]) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center items-center flex-col ">
      <h3 className="text-xl font-bold text-violet-800 tracking-tight sm:text-center sm:text-xl">
        Lucky Numbers
      </h3>
      <DrawnNumbersTable
        onDrawnNumbersUpdate={props.setDrawnNumbersList}
      ></DrawnNumbersTable>
    </div>
  );
}

function MyCardsHeader() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
        Your Cards
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
        You can see your cards here and see if you win any of them!
      </p>
    </div>
  );
}
