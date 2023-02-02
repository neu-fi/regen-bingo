import React, { useEffect, useState } from "react";
import {
  MegaphoneIcon,
  XMarkIcon,
  TicketIcon,
  RocketLaunchIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useContext } from "react";
import { BingoStateContext } from "@/components/Layout";
import { BingoState } from "@/hooks/useBingoContract";
import { tabs } from "@/components/Header";
import moment, { now } from "moment";
import { useContractRead } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";

type BannerProps = {
  setShowBanner: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
};

export function Banner(props: BannerProps) {
  const { setShowBanner, activeTab } = props;
  const [bannerContent, setBannerContent] = useState<string>("");
  const bingoState = useContext(BingoStateContext);
  const [drawTimestamp, setDrawTimestamp] = useState<number>();
  const [humanizedCountdown, setHumanizedCountdown] = useState<string>("");
  const [icon, setIcon] = useState<JSX.Element>(
    <MegaphoneIcon className="h-6 w-6 text-white" aria-hidden="true" />
  );
  const [drawCount, setDrawCount] = useState<number>(0);

  const getDrawTimestamp = useContractRead({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "firstDrawTimestamp",
    onSuccess(data: any) {
      setDrawTimestamp(Number(data));
    },
    onError() {
      console.log("Error");
    },
    onSettled() {
      console.log("Triggered drawTimeStamp");
    },
    watch: true,
  });

  const getDrawnNumbersCount = useContractRead({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "drawnNumbersCount",
    onSuccess(data: any) {
      setDrawCount(Number(data));
    },
    onError() {
      console.log("Error");
    },
    onSettled() {
      console.log("Triggered drawTimeStamp");
    },
    watch: true,
  });

  useEffect(() => {
    if (drawTimestamp) {
      setHumanizedCountdown(
        moment
          .duration(moment.unix(drawTimestamp).diff(moment.now()))
          .humanize()
      );
    }
  }, [drawTimestamp]);

  useEffect(() => {
    switch (bingoState) {
      case BingoState.MINT:
        // TODO: Change this to a better icon
        setIcon(
          <TicketIcon className="h-6 w-6 text-black" aria-hidden="true" />
        );
        if (drawTimestamp && Date.now() / 1000 < drawTimestamp) {
          setIcon(
            <RocketLaunchIcon
              className="h-6 w-6 text-black"
              aria-hidden="true"
            ></RocketLaunchIcon>
          );
          setBannerContent(`${humanizedCountdown} is left for minting cards`);
        } else {
          setIcon(
            <HandRaisedIcon
              className="h-6 w-6 text-black"
              aria-hidden="true"
            ></HandRaisedIcon>
          );
          setBannerContent(`Draw can start anytime now!`);
        }
        break;
      case BingoState.DRAW:
        setBannerContent(
          `${drawCount} numbers are drawn. You need to claim the prize if you're eligible!`
        );
        break;
      case BingoState.END:
        setBannerContent(
          "The game has ended. See the donation we've made collectively!"
        );
        break;
    }
  }, [bingoState]);

  return (
    <div className="fixed inset-x-0 bottom-0 pb-2 sm:pb-5 z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-1 p-2 shadow-lg sm:p-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-yellow-3 p-2">{icon}</span>
              <p className="ml-3 truncate font-medium text-black">
                {/* <span className="md:hidden">We announced a new product!</span> */}
                {bannerContent}
              </p>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <Link
                onClick={() => {
                  setShowBanner(false);
                }}
                href={activeTab}
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-green-1"
              >
                {tabs.find((tab) => tab.href === activeTab)?.name}
              </Link>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="group -mr-1 flex rounded-md p-2 hover:bg-yellow-3 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon
                  className="h-6 w-6 text-white group-hover:text-black"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
