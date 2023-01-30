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
import { getToken, isSVG, clipHash, getTxn } from "@/utils/utils";
import { ICard } from "./Card";
import Link from "next/link";

type MintProps = {};

export default function Mint(props: PropsWithChildren<MintProps>) {
  const bingoState = useContext(ContractStateContext);
  const winnerCardId = useContext(WinnerCardContext);
  const networkState = useContext(NetworkContext);
  const [winnerCardURI, setWinnerCardURI] = useState<ICard>();
  const [claimTxn, setClaimTxn] = useState<string | undefined>();

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

    const getWinnerCardEvent = async () => {
      const owner = await contract.ownerOf(winnerCardId);
      console.log(owner);
      const filter = contract.filters.ClaimPrize();
      const events = await contract.queryFilter(filter, 0, "latest");
      const latest = events.find((event) => event.args!.winner === owner);
      if (latest) {
        return latest.transactionHash!;
      } else {
        return;
      }
    };

    getWinnerCardEvent().then((txnHash: any) => {
      setClaimTxn(txnHash);
    });

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
    <div className="bg-green-1 flex justify-between">

    <div className="bg-left bg-no-repeat bg-contain  w-2/12 max-w-md"></div>      

      <div className="container mx-auto max-w-2x1 w-8/12 lg:py-12">
        <img className="" src="/landing-board.png"/> 
      </div>

    <div className="bg-right bg-no-repeat bg-contain w-2/12 max-w-md"></div>
    </div>
  );
}
