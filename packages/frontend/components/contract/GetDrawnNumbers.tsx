import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "@/config";
import { regenBingoABI } from "@/contracts/regen_bingo_abi";
import { useContract, useProvider } from "wagmi";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";

type GetDrawnNumbersProps = {
  onDrawnNumbersUpdate: (drawnNumbers: ITableElement[]) => void;
};

export const GetDrawnNumbers = (props: GetDrawnNumbersProps) => {
  const [drawnNumbers, setDrawnNumbers] = useState<ITableElement[]>([]);
  let drawCooldownMilis = 100000;

  const provider = useProvider();
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: provider,
  });

  useEffect(() => {
    getDrawCooldownSeconds();
    getDrawnNumbers();
    const interval = setInterval(() => {
      getDrawnNumbers(interval);
    }, drawCooldownMilis);
    return () => clearInterval(interval);
  }, []);

  const getDrawnNumbers = async (interval?: NodeJS.Timer) => {
    //A view function that returns drawnNumbers in an array can be added to contract
    let updatedDrawnNumbers: ITableElement[] = [];
    try {
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
    } catch (err) {
      console.log(err);
      // If there is an error, we will use a mock array
      updatedDrawnNumbers = [
        {
          drawnNumber: 3,
          timestamp: "2023-01-01T12:00:00Z",
          seed: "847a3ccdfd0af697b14d3360c793bf3cfd36ce3c",
          txHash: "0x1234567890",
        },
        {
          drawnNumber: 2,
          timestamp: "2023-01-01T12:00:00Z",
          seed: "seed",
          txHash: "0x1234567890",
        },
        {
          drawnNumber: 21,
          timestamp: "2023-01-01T12:00:00Z",
          seed: "seed",
          txHash: "0x1234567890",
        },
      ];
    }
    setDrawnNumbers(updatedDrawnNumbers);
    props.onDrawnNumbersUpdate(updatedDrawnNumbers);
  };

  const getDrawCooldownSeconds = async () => {
    try {
      drawCooldownMilis = (await contract?.drawNumberCooldownSeconds()) * 1000;
    } catch (err) {
      console.log("Failed to getting drawCooldown");
    }
  };

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
