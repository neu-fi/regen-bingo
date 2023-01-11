import React, { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { useBingoContract } from "@/hooks/useBingoContract";
import { timestampToCountdown, toastOptions } from "@/utils/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import { errorSlicing } from "@/utils/utils";
import { Contract } from "ethers";

export const DrawnCountDown = () => {
  const [remainingTime, setRemainingTime] = useState<number>();
  const [drawTimestamp, setTimeStamp] = useState<number>(0);

  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  const getDrawTime = async () => {
    try {
      const drawTime = Number(await contract!.drawTimestamp());
      setTimeStamp(drawTime);
    } catch (err: any) {
      console.log(err);
      toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
    }
  };

  function changeRemaining() {
    const diff = drawTimestamp - new Date().getTime();
    setRemainingTime(diff);
  }

  useEffect(() => {
    if (!drawTimestamp && contract) {
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
