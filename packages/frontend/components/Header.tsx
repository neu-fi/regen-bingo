import Link from "next/link";
import router, { NextRouter, useRouter } from "next/router";
import { ConnectOrSwitchNetworkButton } from "./web3/ConnectOrSwitchNetworkButton";

type HeaderProps = {};

interface ITab {
  name: string;
  href: string;
}

export const tabs: ITab[] = [
  { name: "My Cards", href: "/my-cards" },
  { name: "Lucky Numbers", href: "/lucky-numbers" },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function redirectToTab($event: React.ChangeEvent<HTMLSelectElement>): void {
  const tab = tabs.find((tab: ITab) => tab.name === $event.target.value);
  if (tab) {
    router.push(tab.href);
  }
}

function isCurrent(tab: ITab, router: NextRouter): boolean {
  return router.pathname === tab.href;
}

export default function Header(props: HeaderProps) {
  const router = useRouter();

  return (
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
            <div className="block sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              <select
                id="tabs"
                name="tabs"
                className="text-lg ml-2 p-2 rounded-xl shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 "
                defaultValue={tabs.find((tab) => isCurrent(tab, router))?.name}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  redirectToTab(event)
                }
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav
                className="flex justify-evenly mr-2 md:mr-4 space-x-4 lg:space-x-6 xl:space-x-8"
                aria-label="Tabs"
              >
                {tabs.map((tab) => (
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
  );
}
