import BingoCard from "@/components/BingoCard";
import { PropsWithChildren } from "react";
import { BingoCardMint } from "./contract/BingoCardMint";
import { DrawnCountDown } from "./contract/DrawnCountDown";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  return (
    <div className="relative px-6 lg:px-8">
      <section id="">
        <div className="flex lg:flex-1 justify-between lg:flex-nowrap flex-wrap">
          <div className="mx-auto max-w-3xl md:max-2xl:max-w-xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Regen Bingo
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  Mint your Bingo card NFT to contribute to public goods funding
                  while getting a chance to claim the prize pool!
                </p>
                <div className="mt-2 text-md text-gray-600 sm:text-center">
                  <DrawnCountDown />
                </div>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <BingoCardMint />
                  <a
                    href="#guide"
                    className="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                  >
                    {"What the heck is this? "}
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
