import { PropsWithChildren } from "react";
import { BingoCardMint } from "./contract/BingoCardMint";
import { DrawnCountDown } from "./contract/DrawnCountDown";
import Image from "next/image";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  return (
    <div className="relative px-6 lg:px-8">
      <section id="">
        <div className="mt-4 flex space-x-1 lg:flex-1 justify-between lg:flex-nowrap flex-wrap">
          <div className="mx-auto ml-5 max-w-3xl md:max-2xl:max-w-xl pt-20 pb-32 sm:pt-48 sm:pb-40">
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
                {/* TODO: Finish BingoCardMint component according to the design below
                 <BingoCardMint /> 
                */}
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <a
                    href="#"
                    onClick={() => {
                      //TODO: Mint with wallet
                    }}
                    className="inline-flex items-center  w-auto rounded-lg bg-green-2 px-4 py-1.5 text-base text-white font-semibold leading-7 shadow-sm hover:bg-green-1"
                  >
                    {"Mint with Wallet"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="ml-2 w-5 h-5"
                    >
                      <path d="M1 4.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 2H3.25A2.25 2.25 0 001 4.25zM1 7.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 5H3.25A2.25 2.25 0 001 7.25zM7 8a1 1 0 011 1 2 2 0 104 0 1 1 0 011-1h3.75A2.25 2.25 0 0119 10.25v5.5A2.25 2.25 0 0116.75 18H3.25A2.25 2.25 0 011 15.75v-5.5A2.25 2.25 0 013.25 8H7z" />
                    </svg>
                  </a>
                  <a
                    href="#guide"
                    className="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                  >
                    {"What the heck is this? "}
                    <span className="text-yellow-1" aria-hidden="true">
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
