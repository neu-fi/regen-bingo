import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { BingoCardMint } from "./contract/BingoCardMint";
import { DrawnCountDown } from "./contract/DrawnCountDown";
import Image from "next/image";
import {
  ContractStateContext,
  WinnerCardContext,
  NetworkContext,
} from "@/components/Layout";
import { BingoState, useBingoContract } from "@/hooks/useBingoContract";
import { useProvider } from "wagmi";
import { Contract } from "ethers";
import { getToken, isSVG } from "@/utils/utils";
import { ICard } from "./Card";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  const bingoState = useContext(ContractStateContext);
  const winnerCardId = useContext(WinnerCardContext);
  const networkState = useContext(NetworkContext);
  const [winnerCardURI, setWinnerCardURI] = useState<ICard>();

  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  useEffect(() => {
    const getWinnerCardURI = async () => {
      try {
        const tokenURI: ICard = await getToken(contract!, winnerCardId!);
        return tokenURI;
      } catch (error) {
        console.log(error);
      }
    };
    if (!contract || !winnerCardId || bingoState !== BingoState.FINISHED) {
      return;
    }

    getWinnerCardURI().then((cardURI: ICard | undefined) => {
      if (cardURI) {
        setWinnerCardURI(cardURI);
      }
    });
  }, [bingoState, winnerCardId]);

  useEffect(() => {
    // append svg as as child of div with "tokenImage" id if it does not exist
    if (winnerCardURI && isSVG(winnerCardURI.tokenURI.image)) {
      const tokenImage = document.getElementById("tokenImage");
      if (!tokenImage) {
        const div = document.createElement("div");
        div.id = "svg";
        div.innerHTML = winnerCardURI.tokenURI.image;
        document.body.appendChild(div);
      } else {
        tokenImage.innerHTML = winnerCardURI.tokenURI.image;
      }
    }
  }, [winnerCardURI]);

  return (
    <div className="relative px-6 lg:px-8">
      <section id="">
        <div className="mx-auto mt-4  max-w-5xl flex space-x-1 lg:flex-1 justify-between lg:flex-nowrap flex-wrap">
          <div className="mx-auto max-w-xl ml-5 pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Regen Bingo
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  Mint Regen Bingo Cards to contribute to public goods funding
                  while getting a chance to claim the prize pool!
                </p>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  {bingoState === BingoState.MINT && networkState && (
                    <BingoCardMint />
                  )}
                  <a
                    href="#guide"
                    className="inline-block rounded-lg  px-2 sm:px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                  >
                    {"What the heck is this? "}
                    <span className="text-yellow-1" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
                <div className="mt-8 text-md text-gray-600 sm:text-center">
                  {networkState && <DrawnCountDown />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="flex h-96 w-96">
              <>
                {winnerCardURI ? (
                  <div
                    id="tokenImage"
                    className="h-full w-full aspect-w-1 aspect-h-1 sm:aspect-w-1 sm:aspect-h-1 my-2"
                  ></div>
                ) : (
                  <Image
                    src="/board-example.svg"
                    height={"400"}
                    width={"400"}
                    alt=""
                  />
                )}
              </>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
