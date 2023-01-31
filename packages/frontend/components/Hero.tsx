import { PropsWithChildren, useContext, useState } from "react";
import Image from "next/image";
import { BingoStateContext } from "@/components/Layout";
import { BingoState } from "@/hooks/useBingoContract";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { useWatchAccount } from "../hooks/useWatchAccount";
import { getAccount, GetAccountResult } from "@wagmi/core";
import { ConnectOrSwitchNetworkButton } from "./web3/ConnectOrSwitchNetworkButton";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const bingoState = useContext(BingoStateContext);
  const [account, setAccount] = useState<GetAccountResult>(() => getAccount());

  return isMobile ? (
    // Mobile View
    <>
      <div className="pb-4 bg-green-1 h-[calc(80vh)] flex flex-col justify-evenly overflow-hidden">
        <div className="bg-img-left object-top bg-no-repeat bg-cover min-h-[75vw] w-3/4 max-w-md">
          <img
            className="transform rotate-12 translate-x-36 translate-y-10"
            src="./example-board@3x.png"
            alt="board"
          />
        </div>

        <div className="flex flew-row">
          <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center">
              <div className="flex flex-row justify-center">
                <span className="text-xl font-hero w-2/3">
                  Mint Regen Bingo Cards to contribute to public goods funding
                  while getting a chance to claim the prize pool!
                </span>
              </div>
              <div className="flex flex-row justify-center mt-2 py-2">
                {account.isConnected ? (
                  <>
                    <Link
                      href="/mint"
                      className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center w-auto rounded-full border-connect-green border-[0.0675rem] bg-green-2 px-24 py-3 text-base text-white font-semibold leading-7 shadow-sm hover:bg-green-1"
                    >
                      <span className="text-xl font-hero font-normal">
                        Mint Now!
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <ConnectOrSwitchNetworkButton></ConnectOrSwitchNetworkButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    // Desktop View
    <>
      <div className="bg-green-1 flex justify-between">
        <div className="bg-img-left bg-no-repeat bg-contain w-2/12 max-w-md"></div>
        <div className="container mx-auto max-w-2x1 w-8/12 lg:py-16">
          <img loading="lazy" alt="hero-image" src="./landing-board.png" />
        </div>
        <div className="bg-img-right bg-no-repeat bg-contain w-2/12 max-w-md"></div>
      </div>
    </>
  );
}
