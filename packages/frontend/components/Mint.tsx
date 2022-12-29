import BingoCard from "@/components/BingoCard";
import { PropsWithChildren } from "react";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  return (
    <div className="relative px-6 lg:px-8">
      <section id="">
        <div className="flex lg:flex-1 justify-between lg:flex-nowrap flex-wrap">
          <div className="mx-auto max-w-3xl md:max-2xl:max-w-xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div>
                {/* TODO: Content of the minting page */}
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Mint
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  Groundbreaking Web3 Bingo game, only designed to draw once in
                  a year. Mint your bingo card NFT now to earn a chance to win
                  the jackpot! The jackpot is 50% of the total sales. The rest
                  will be fund for ReFi Revolution.
                </p>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <a
                    href="#"
                    onClick={() => {
                      //TODO: Mint with wallet
                    }}
                    className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                  >
                    <img src=""></img>
                    {"Mint with Wallet "}
                    <span className="text-indigo-200" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                  <a
                    href="#guide"
                    className="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                  >
                    {"How to Play "}
                    <span className="text-gray-400" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
                <div className="mt-8">
                  {/* <GetGreeter />
                    <SetGreeter /> */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex lg:flex-1 mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40 items-center justify-center">
            <div className="flex">
              <BingoCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
