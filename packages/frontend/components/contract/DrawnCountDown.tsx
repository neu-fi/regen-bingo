import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "@/config";
import { regenBingoABI } from "@/contracts/regen_bingo_abi";
import { useContract, useProvider } from "wagmi";
import { timestampToCountdown } from "@/utils/utils";
import Link from "next/link";

export const DrawnCountDown = () => {
  const [remainingTime, setRemainingTime] = useState<number>();
  const [drawTimestamp, setTimeStamp] = useState<number>(0);

  const provider = useProvider();
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: provider,
  });

  const getDrawTime = async () => {
    try {
      const drawTime = Number(await contract?.drawTimestamp());
      setTimeStamp(drawTime);
    } catch (err) {
      console.log(err);
    }
  };

  function changeRemaining() {
    const diff = drawTimestamp - new Date().getTime();
    setRemainingTime(diff);
  }

  useEffect(() => {
    if (!drawTimestamp) {
      getDrawTime();
    }
    const interval = setInterval(() => {
      changeRemaining();
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <>
      {remainingTime ? (
        <>
          {remainingTime > 0 ? (
            <>
              Numbers will be drawn in
              <span className="text-green-4">
                {timestampToCountdown(remainingTime / 1000)}
              </span>
            </>
          ) : (
            <span>
              Lucky numbers have been drawn!{" "}
              <Link href="my-cards" className="text-yellow-1">
                <span>Check your card now.</span>
              </Link>
            </span>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
