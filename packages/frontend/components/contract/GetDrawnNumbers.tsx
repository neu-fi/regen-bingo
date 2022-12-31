import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "@/config";
import { regenBingoABI } from "@/contracts/regen_bingo_abi";
import { useContract, useProvider } from "wagmi";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";

export const GetDrawnNumbers = () => {
  const [drawnNumbers, setDrawnNumbers] = useState<ITableElement[]>([]);
  let drawCooldownMilis = 100000;

  const provider = useProvider();
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: provider,
  });

  const getDrawnNumbers = async () => {
    //A view function that returns drawnNumbers in an array can be added to contract
    try {
      const updatedDrawnNumbers: ITableElement[] = [];
      for (var i = 1; i < 91; i++) {
        const drawn = await contract?.isDrawn(i);
        if (drawn) {
          updatedDrawnNumbers.push({
            drawnNumber: i,
            timestamp: "2021-05-01T12:00:00Z",
            seed: "seed",
            txHash: "0x0000",
          });
        }
      }
      setDrawnNumbers(updatedDrawnNumbers);
    } catch (err) {
      console.log(err);
    }
  };

  const getDrawCooldownSeconds = async () => {
    try {
      drawCooldownMilis = (await contract?.drawNumberCooldownSeconds()) * 1000;
    } catch (err) {
      console.log("Failed to getting drawCooldown");
    }
  };

  useEffect(() => {
    getDrawCooldownSeconds();
    getDrawnNumbers();
    const interval = setInterval(() => {
      getDrawnNumbers();
    }, drawCooldownMilis);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {drawnNumbers.length == 0 && (
        <div className="text-xl m-20 font-semibold">Loading...</div>
      )}
      {drawnNumbers.length > 0 && (
        <DrawnNumbersTable drawnNumbers={drawnNumbers}></DrawnNumbersTable>
      )}
    </>
  );
};
