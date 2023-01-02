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
  const [drawTimestamp, setTimeStamp] = useState("");

  const provider = useProvider();
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: provider,
  });

  const calcRemainigTime = async () => {
    try {
      const drawTime = await contract?.drawTimestamp();
      setTimeStamp(drawTime.toString());
    } catch (err) {
      console.log(err);
    }
  };

  function changeRemaining() {
    const difference = calcTimeDifference(
      secondStringToDate(drawTimestamp),
      new Date()
    );
    setReamainingTime(difference);
  }

  useEffect(() => {
    if (!drawTimestamp) {
      calcRemainigTime();
    }
    const interval = setInterval(() => {
      changeRemaining();
    }, 1000);
    return () => clearInterval(interval);
  });

  return <>{secondsToDate(remainingTime)}</>;
};
