import { classNames } from "@/utils/utils";
import React from "react";
import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";

type CardProps = {
  card: ICard;
  displayPublicDetails?: Boolean;
};

export interface ICard {
  id: number;
  coveredNumbersCount: number;
  tokenURI: ITokenURI;
  hash?: string;
}

export interface ITokenURI {
  name: string;
  description: string;
  image: string;
}

const ClaimButton = (props: {
  matchCount: number;
  didWinPrize: (matchCount: number) => boolean;
}) => {
  return (
    (props.didWinPrize(props.matchCount) && (
      <div className="flex justify-center">
        <button
          type="button"
          className="
          inline-flex items-center rounded-md border border-transparent 
          bg-green-2 px-4 py-2 text-base font-medium 
          hover:bg-green-1 focus:outline-none text-white
          "
        >
          {"Claim Prize"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="ml-2 w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-4.482 1.332.75.75 0 01-.461-.461 3.994 3.994 0 011.332-4.482.75.75 0 011.052.134z"
              clipRule="evenodd"
            />
            <path
              clipRule="evenodd"
              d="M5.752 12A13.07 13.07 0 008 14.248v4.002c0 .414.336.75.75.75a5 5 0 004.797-6.414 12.984 12.984 0 005.45-10.848.75.75 0 00-.735-.735 12.984 12.984 0 00-10.849 5.45A5 5 0 001 11.25c.001.414.337.75.751.75h4.002zM13 9a2 2 0 100-4 2 2 0 000 4z"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>
    )) || <></>
  );
};

export default function Card(props: CardProps) {
  const { card, displayPublicDetails = false } = props;

  function isSVG(card: ICard): boolean {
    return card.tokenURI.image.includes(`<svg `);
  }

  function didWinPrize(): boolean {
    return card.coveredNumbersCount === 15;
  }

  return (
    <div className="mt-4 space-y-4 sm:grid sm:grid-cols-2 sm:items-start sm:gap-6 sm:space-y-0">
      <div>
        <div className="aspect-w-9 aspect-h-3 sm:aspect-w-9 sm:aspect-h-3 my-2">
          <div
            className="h-auto bg-cover rounded-lg"
            dangerouslySetInnerHTML={
              isSVG(card)
                ? {
                    __html: card.tokenURI.image,
                  }
                : {
                    __html: "",
                  }
            }
          ></div>
        </div>
      </div>

      <div className="sm:col-span-1">
        <div className="space-y-4">
          <div className="space-y-2 text-lg font-medium leading-6">
            <h3>
              Regen Bingo NFT{" "}
              <Link href={`/cards/${card.id}`} className="text-lg text-green-2">
                #{card.id}
              </Link>
            </h3>
          </div>

          <ul role="list" className="flex space-x-5">
            <li>
              <a
                href={`https://opensea.io/assets/ethereum/${card.hash}`}
                target="_blank"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Opensea</span>
                <Image
                  src="/opensea-logo.svg"
                  alt="Opensea Logo"
                  width={24}
                  height={24}
                />
              </a>
            </li>
          </ul>
          <div className="text-lg">
            <p className="text-gray-500">
              {didWinPrize() ? (
                "Congratulations, you won the prize! Please claim your prize."
              ) : (
                <>
                  Unlucky, you have{" "}
                  {card.coveredNumbersCount === 0
                    ? "no matches. "
                    : card.coveredNumbersCount === 1
                    ? "1 match. "
                    : `${card.coveredNumbersCount} matches. `}
                  Better luck next time!
                </>
              )}
            </p>
          </div>
          <div className="block">
            <ClaimButton
              matchCount={card.coveredNumbersCount}
              didWinPrize={didWinPrize}
            ></ClaimButton>
          </div>
        </div>
      </div>
    </div>
  );
}
