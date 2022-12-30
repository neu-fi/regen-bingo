import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import router, { useRouter } from "next/router";
import React, { useEffect } from "react";
import { ConnectOrSwitchNetworkButton } from "./web3/ConnectOrSwitchNetworkButton";

type HeaderProps = {};

export const tabs = [
  { name: "Mint", href: "/", current: true },
  { name: "My Cards", href: "/my-cards", current: false },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function redirectToTab($event: any): void {
  const tab = tabs.find((tab) => tab.name === $event.target.value);
  if (tab) {
    router.push(tab.href);
  }
}

export default function Header(props: HeaderProps) {
  const router = useRouter();

  return (
    <div className="px-6 pt-6 lg:px-8">
      <div>
        <nav
          className="flex h-9 items-center justify-between"
        >
          <div>
            <a href="/#" className="-m-1.5 p-1.5">
              <span className="sr-only">Regen Bingo</span>
              <img
                className="h-8 sm:h-4 md:h-6"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
          </div>
          <div className="mr-4 sm:max-2xl:mr-0 lg:mr-0 flex justify-center font-semibold">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                className="text-lg ml-2 p-2 rounded-xl shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 "
                defaultValue={
                  tabs.find((tab) => router.asPath === tab.href)?.name
                }
                onChange={(event) => redirectToTab(event)}
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="ml-28 md:ml-44 space-x-8 lg:space-x-12 xl:space-x-16" aria-label="Tabs">
                {tabs.map((tab) => (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      router.asPath === tab.href
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:text-gray-900",
                      "px-4 py-3 rounded-xl "
                    )}
                    aria-current={
                      router.asPath === tab.href ? "page" : undefined
                    }
                  >
                    {tab.name}
                  </Link>
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
