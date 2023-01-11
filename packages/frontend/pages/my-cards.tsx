import { PropsWithChildren, useState } from "react";
import Head from "next/head";
import CardList from "@/components/CardList";

type MyCardsProps = {};

export default function MyCards(props: PropsWithChildren<MyCardsProps>) {
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
            <div className="row-span-full mt-4">
              <div className="flex flex-col justify-center items-stretch flex-nowrap">
                <CardList></CardList>
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
        You can see your Regen Bingo Card NFTs here and watch them as the
        numbers are drawn!
      </p>
    </div>
  );
}
