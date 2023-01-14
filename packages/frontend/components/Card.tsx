import Image from "next/image";
import Link from "next/link";
import { clipHash } from "@/utils/utils";
import { CONTRACT_ADDRESS, NETWORK } from "@/config";
import { BingoCardMint } from "./contract/BingoCardMint";
import { ClaimThePrizeButton } from "./contract/ClaimThePrizeButton";
import { BingoState } from "@/hooks/useBingoContract";

type CardProps = {
  card: ICard;
  displayPublicDetails?: Boolean;
};

export interface ICard {
  id: string;
  coveredNumbersCount: number;
  tokenURI: ITokenURI;
}

export interface ITokenURI {
  name: string;
  description: string;
  image: string;
}

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
                #{clipHash(card.id)}
              </Link>
            </h3>
          </div>

          <ul role="list" className="flex space-x-5">
            <li>
              <a
                href={`https://${
                  NETWORK == "goerli" ? `testnets.` : ``
                }opensea.io/assets/${
                  NETWORK == "goerli" ? `goerli` : `ethereum`
                }/${CONTRACT_ADDRESS}/${BigInt(card.id)}`}
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
            <>
              {didWinPrize()
                ? (
                  <>
                    <p className="text-gray-500">
                      Full house! Claim the prize immidately! 🔥
                    </p>
                    <ClaimThePrizeButton
                      tokenId={card.id}
                    />
                  </>
                )
                : (
                    <p className="text-gray-500">
                      You have{" "}
                      {card.coveredNumbersCount === 0
                        ? "no matches"
                        : card.coveredNumbersCount === 1
                        ? "1 match"
                        : `${card.coveredNumbersCount} matches`}
                      {card.coveredNumbersCount ? "! " : ". "}
                    </p>
                  )
              }
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
