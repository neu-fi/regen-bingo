import Image from "next/image";
import Link from "next/link";
import { isSVG } from "@/utils/utils";
import { CONTRACT_ADDRESS, CHAIN_NAME } from "@/config";
import { ClaimThePrizeButton } from "./contract/ClaimThePrizeButton";
import { useContext } from "react";
import { BingoStateContext } from "@/components/Layout";
import { BingoState } from "@/hooks/useBingoContract";

type CardProps = {
  card: ICard;
  displayPublicDetails?: Boolean;
};

export interface ICard {
  id: number;
  tokenURI: ITokenURI;
}

export interface ITokenURI {
  description: string;
  external_url: string;
  image: string;
  name: string;
  numbers: Array<number[]>;
  score: number;
}

function openseaURL(tokenId: bigint) {
  switch (CHAIN_NAME) {
    case "Ethereum":
      return `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${tokenId}`;
    case "Goerli":
      return `https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${tokenId}`;
    case "Hardhat":
      return `https://opensea.io/assets/hardhat/${CONTRACT_ADDRESS}/${tokenId}`;
  }
}

export default function Card(props: CardProps) {
  const { card, displayPublicDetails = false } = props;
  const bingoState = useContext(BingoStateContext);

  function didWinPrize(): boolean {
    return card.tokenURI.score === 15;
  }

  function isClaimed(): boolean {
    return bingoState === BingoState.END;
  }

  return (
    <div className="mt-4 space-y-4 sm:grid sm:items-start sm:gap-6 sm:space-y-0">
      <div>
        <div className="aspect-w-1 aspect-h-1 sm:aspect-w-1 sm:aspect-h-1">
          <div
            className="h-auto bg-cover rounded-lg"
            dangerouslySetInnerHTML={
              isSVG(card.tokenURI.image)
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
              <Link href={`/cards/${card.id}`} className="text-lg text-green-2">
                Regen Bingo Card #{card.id}
              </Link>

              <Link
                href={new URL(openseaURL(BigInt(card.id))!)}
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
              </Link>
            </h3>
          </div>

          <ul role="list" className="flex space-x-5">
            <li></li>
          </ul>
          <div className="text-lg text-center">
            <>
              {didWinPrize() && !isClaimed() ? (
                <>
                  <p className="text-gray-500 mb-4">
                    Full house! Claim the prize immedately! 🔥
                  </p>
                  <ClaimThePrizeButton tokenId={card.id} />
                </>
              ) : !didWinPrize() ? (
                <p className="text-gray-500">
                  Has{" "}
                  {card.tokenURI.score === 0
                    ? "no matches."
                    : card.tokenURI.score === 1
                    ? "1 match!"
                    : `${card.tokenURI.score} matches!`}
                </p>
              ) : (
                <span>Winner of the GitCoin Alpha Round!</span>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
