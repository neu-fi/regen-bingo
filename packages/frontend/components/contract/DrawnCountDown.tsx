import React, { useEffect, useState } from "react";
import { CUSTOM_REAMAINING_TIME, CONTRACT_ADDRESS } from "@/config";
import { regenBingoABI } from "@/contracts/regen_bingo_abi";
import { useContract, useProvider } from "wagmi";
import {
  secondStringToDate,
  calcTimeDifference,
  secondsToDate,
} from "@/utils/utils";

export const DrawnCountDown = () => {
  const [remainingTime, setReamainingTime] = useState(0);

  const provider = useProvider();
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: provider,
  });

  const calcRemainigTime = async () => {
    try {
      const drawTimestamp = await contract?.drawTimestamp();
      const difference = calcTimeDifference(
        secondStringToDate(drawTimestamp.toString()),
        new Date()
      );
      setReamainingTime(difference);
    } catch (err) {
      console.log(err);
    }
  };
  async function changeRemaining(isMinus: boolean) {
    if (!isMinus) {
      setReamainingTime((prev) => prev - 1);
    } else {
      setReamainingTime(-1);
    }
  }
  useEffect(() => {
    calcRemainigTime();
    let countDown = setInterval(() => {
      changeRemaining(remainingTime < 0);
    }, 1000);
    return;
  }, []);
  return <>{secondsToDate(remainingTime)}</>;
};
