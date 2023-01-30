import { PropsWithChildren, useEffect, useState } from "react";
import Head from "next/head";
import CardList from "@/components/CardList";
import { useProvider } from "wagmi";
import { BigNumber, Contract } from "ethers";
import { useBingoContract } from "@/hooks/useBingoContract";
import { toast } from "react-toastify";

type MyCardsProps = {};

export default function MyCards(props: PropsWithChildren<MyCardsProps>) {
  const [trigger, setTrigger] = useState<Event>();
  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);
  useEffect(() => {
    if (contract) {
      contract.on("DrawNumber", eventHandler);
    }
    return () => {
      if (contract) {
        contract.off("DrawNumber", eventHandler);
      }
    };
  }, []);

  const eventHandler = async (number: BigNumber, event: Event) => {
    const luckyNumber = number.toNumber();
    if (luckyNumber === undefined) return;
    toast.info(`New number drawn: ${luckyNumber}`);
    setTrigger((trigger) => new Event("fetchCards"));
  };

  return (
    <>
      <Head>
        <title>My Cards</title>
      </Head>
      <div className="container mx-auto">
      <div className="relative max-w-full px-6 lg:px-8">
        <div className="w-full mt-10 pb-0">
            <div className="w-full">
              <MyCardsHeader></MyCardsHeader>
            </div>
            <div className="w-full mt-4">
              <div className="flex flex-col justify-center items-stretch flex-nowrap">
                <CardList trigger={trigger}></CardList>
              </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

function MyCardsHeader() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
        My Cards
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
        You can see your Regen Bingo Cards here and watch them as the
        numbers are drawn!
      </p>
    </div>
  );
}
