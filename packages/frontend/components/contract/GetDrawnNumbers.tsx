import React, { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";
import { useBingoContract } from "@/hooks/useBingoContract";

type GetDrawnNumbersProps = {
  onDrawnNumbersUpdate: (drawnNumbers: ITableElement[]) => void;
};

export const GetDrawnNumbers = (props: GetDrawnNumbersProps) => {
  const [drawnNumbers, setDrawnNumbers] = useState<ITableElement[]>([]);
  const [loading, setLoading] = useState("");
  let drawCooldownMilis = 100000;

  const provider = useProvider();
  const contract = useBingoContract(provider);

  useEffect(() => {
    getDrawCooldownSeconds();
    getDrawnNumbers();
    const interval = setInterval(() => {
      getDrawnNumbers(interval);
    }, drawCooldownMilis);
    return () => clearInterval(interval);
  }, []);

  const getDrawnNumbers = async (interval?: NodeJS.Timer) => {
    setLoading("Loading...");
    //A view function that returns drawnNumbers in an array can be added to contract
    let updatedDrawnNumbers: ITableElement[] = [];
    try {
      for (var i = 1; i < 91; i++) {
        const drawn = await contract?.isDrawn(i);
        if (drawn) {
          updatedDrawnNumbers.push({
            drawnNumber: i,
            timestamp: "2023-01-01T12:00:00Z",
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
        },
        {
          drawnNumber: 2,
          timestamp: "2023-01-01T12:00:00Z",
        },
        {
          drawnNumber: 21,
          timestamp: "2023-01-01T12:00:00Z",
        },
        {
          drawnNumber: 33,
          timestamp: "2023-01-01T12:00:00Z",
        },
        {
          drawnNumber: 31,
          timestamp: "2023-01-01T12:00:00Z",
        },
      ];
    }
    setDrawnNumbers(updatedDrawnNumbers);
    if (drawnNumbers.length === 0) {
      setLoading("No numbers drawn yet.");
    } else {
      setLoading("");
    }
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
        <div className="text-xl m-20 font-semibold">{loading}</div>
      )}
      {drawnNumbers.length > 0 && (
        <DrawnNumbersTable drawnNumbers={drawnNumbers}></DrawnNumbersTable>
      )}
    </>
  );
};
