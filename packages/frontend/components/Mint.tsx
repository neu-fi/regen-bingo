import { PropsWithChildren } from "react";
import { BingoCardMint } from "./contract/BingoCardMint";
import { DrawnCountDown } from "./contract/DrawnCountDown";
import Image from "next/image";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  return (
    <div className="relative px-6 lg:px-8">
      <section id="">
        <div className="mx-auto mt-4  max-w-5xl flex space-x-1 lg:flex-1 justify-between lg:flex-nowrap flex-wrap">
          <div className="mx-auto max-w-xl ml-5 pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Regen Bingo
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  Mint Regen Bingo Cards to contribute to public goods
                  funding while getting a chance to claim the prize pool!
                </p>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <BingoCardMint />
                  <a
                    href="#guide"
                    className="inline-block rounded-lg  px-2 sm:px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                  >
                    {"What the heck is this? "}
                    <span className="text-yellow-1" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
                <div className="mt-8 text-md text-gray-600 sm:text-center">
                  <DrawnCountDown />
                </div>
              </div>
            </div>
          </div>
          <div className="flex lg:flex-1 mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40 items-center justify-center">
            <div className="flex">
              <Image
                src="/board-example.svg"
                height={"400"}
                width={"400"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
