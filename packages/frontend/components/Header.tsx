import Link from "next/link";
import router, { NextRouter, useRouter } from "next/router";
import { ConnectOrSwitchNetworkButton } from "./web3/ConnectOrSwitchNetworkButton";
import { useMediaQuery } from "react-responsive";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
} from "react";
import { BingoStateContext } from "@/components/Layout";
import { BingoState } from "@/hooks/useBingoContract";

type HeaderProps = {
  setActiveTab: Dispatch<SetStateAction<string>>;
};

interface ITab {
  name: string;
  href: string;
  active: boolean;
}

export const tabs: ITab[] = [
  { name: "🎲 Mint", href: "/mint", active: true },
  { name: "🎰 The Draw", href: "/lucky-numbers", active: false },
  { name: "🫶 The Impact", href: "/impact", active: false },
  { name: "🃏 My Cards", href: "/my-cards", active: true },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function isCurrent(tab: ITab, router: NextRouter): boolean {
  return router.pathname === tab.href;
}

export default function Header(props: HeaderProps) {
  const { setActiveTab } = props;
  const router = useRouter();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const bingoState = useContext(BingoStateContext);

  useEffect(() => {
    if (bingoState !== undefined) {
      switch (bingoState) {
        case BingoState.MINT:
          tabs[0].active = true;
          tabs[1].active = false;
          tabs[2].active = false;
          tabs[3].active = true;
          setActiveTab("/mint");
          break;
        case BingoState.DRAW:
          tabs[0].active = false;
          tabs[1].active = true;
          tabs[2].active = false;
          tabs[3].active = true;
          setActiveTab("/lucky-numbers");
          break;
        case BingoState.END:
          tabs[0].active = false;
          tabs[1].active = false;
          tabs[2].active = true;
          tabs[3].active = true;
          setActiveTab("/impact");
          break;
      }
    }
  }, [bingoState]);

  return !isMobile ? (
    // Default View
    <>
      <div className="px-6 pt-8 pb-8 lg:px-8 bg-green-1">
        <div>
          <nav className="flex h-9 items-center justify-between">
            <div className="flex justify-center align-middle items-center">
              <Link href="/#" className="p-1">
                <span className="sr-only">Regen Bingo</span>
                <img
                  className="hidden sm:portrait:hidden sm:landscape:hidden sm:block md:portrait:hidden md:landscape:hidden lg:landscape:block sm:h-16"
                  src="/logo.png"
                  alt=""
                />
              </Link>
              <Link href="/#" className="p-1">
                <span className="sr-only">Regen Bingo</span>
                <img
                  className="block sm:portrait:block sm:landscape:block mr-2 sm:hidden md:portrait:block md:landscape:block lg:landscape:hidden"
                  width={32}
                  height={32}
                  src="/favicon.svg"
                  alt=""
                />
              </Link>
            </div>
            <div className="mr-1 sm:mr-8 md:-mr-24 flex justify-center font-semibold">
              <div className="block">
                <nav
                  className="flex justify-evenly mr-2 md:mr-4 space-x-4 lg:space-x-6 xl:space-x-8"
                  aria-label="Tabs"
                >
                  {[...tabs.filter((tab) => tab.active)].map((tab) => (
                    <div key={tab.name}>
                      <div className="flex justify-center items-center">
                        <Link
                          key={tab.name}
                          href={tab.href}
                          className={classNames(
                            isCurrent(tab, router)
                              ? "bg-green-3 text-black"
                              : "hover:bg-green-3",
                            "px-4 py-3 rounded-xl text-center"
                          )}
                          aria-current={
                            isCurrent(tab, router) ? "page" : undefined
                          }
                        >
                          {tab.name}
                        </Link>
                      </div>{" "}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
            <ConnectOrSwitchNetworkButton />
          </nav>
        </div>
      </div>
    </>
  ) : (
    // Mobile View
    <>
      <div className="px-3 pt-12 pb-[4.5rem] bg-green-1">
        <nav className="flex flex-grow h-9 items-center justify-center">
          <div className="flex flex-col flex-grow">
            <div className="flex flex-grow flex-row justify-between  landscape:justify-around align-middle items-center">
              <Link href="/#" className="p-1 ">
                <span className="sr-only">Regen Bingo</span>
                <img className="h-[6rem]" src="/no-icon-logo.png" alt="" />
              </Link>

              <ConnectOrSwitchNetworkButton />
            </div>

            <div className="mr-1 sm:mr-8 md:-mr-24 flex flex-row justify-center font-semibold">
              <nav
                className="flex flex-grow justify-evenly mr-2 md:mr-4 space-x-4 lg:space-x-6 xl:space-x-8"
                aria-label="Tabs"
              >
                {[...tabs.filter((tab) => tab.active)].map((tab) => (
                  <div key={tab.name}>
                    <div className="flex justify-center items-center">
                      <Link
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          isCurrent(tab, router)
                            ? "bg-green-3 text-black"
                            : "bg-yellow-100 hover:bg-green-3",
                          "px-4 py-3 rounded-xl text-center"
                        )}
                        aria-current={
                          isCurrent(tab, router) ? "page" : undefined
                        }
                      >
                        {tab.name}
                      </Link>
                    </div>{" "}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
