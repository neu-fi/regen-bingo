import { classNames } from "@/utils/utils";
import React from "react";
import Image from "next/image";
import { useEffect } from "react";

type CardProps = {
  card: ICard;
  drawnNumbers: number[];
};

export interface ICard {
  id: number;
  numbers: number[];
  image: string;
  hash?: string;
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
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-base font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Claim Prize
        </button>
      </div>
    )) || <></>
  );
};

export default function Card(props: CardProps) {
  const [matchCount, setMatchCount] = React.useState<number>(0);
  const { card, drawnNumbers } = props;

  useEffect(() => {
    const assignMatchCount = (
      setMatchCount: React.Dispatch<React.SetStateAction<number>>,
      card: ICard,
      drawnNumbers: number[]
    ) => {
      setMatchCount(
        card.numbers.filter((number) => drawnNumbers.includes(number)).length
      );
    };
    assignMatchCount(setMatchCount, card, drawnNumbers);
  }, [drawnNumbers]);

  function isSVG(card: any): boolean {
    return card.image.includes(`<svg `);
  }

  function didWinPrize(matchCount: number): boolean {
    return matchCount === drawnNumbers.length;
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
                    __html: card.image,
                  }
                : {
                    __html: "",
                  }
            }
          ></div>
        </div>
        <div className="hidden sm:block">
          <ClaimButton
            matchCount={matchCount}
            didWinPrize={didWinPrize}
          ></ClaimButton>
        </div>
      </div>

      <div className="sm:col-span-1">
        <div className="space-y-4">
          <div className="space-y-2 text-lg font-medium leading-6">
            <h3>
              Regen Bingo NFT{" "}
              <span className="text-lg text-indigo-600">#{props.card.id}</span>
            </h3>
          </div>

          <ul role="list" className="flex space-x-5">
            <li>
              <a
                href={`https://opensea.io/assets/ethereum/${props.card.hash}`}
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
              {didWinPrize(matchCount) ? (
                "Congratulations, you won the prize! Please claim your prize."
              ) : (
                <>
                  Unlucky, you have{" "}
                  {matchCount === 0
                    ? "No matches"
                    : matchCount === 1
                    ? "1 match"
                    : `${matchCount} matches. `}
                  Better luck next time!
                </>
              )}
            </p>
          </div>
          <div className="block sm:hidden">
            <ClaimButton
              matchCount={matchCount}
              didWinPrize={didWinPrize}
            ></ClaimButton>
          </div>
        </div>
      </div>
    </div>
  );
}
