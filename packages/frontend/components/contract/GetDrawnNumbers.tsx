import React, { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import DrawnNumbersTable from "@/components/DrawnNumbersTable";
import { useBingoContract } from "@/hooks/useBingoContract";
import { BigNumber, Event, Contract } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing, toastOptions } from "@/utils/utils";

type GetDrawnNumbersProps = {};

export const GetDrawnNumbers = (props: GetDrawnNumbersProps) => {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [initialFetchCompleted, setInitialFetchCompleted] = useState(false); // [1
  const [loading, setLoading] = useState("");

  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  useEffect(() => {
    if (!initialFetchCompleted) {
      (async () => {
        if (!contract) {
          toast.error(`Unexpected Error!`, toastOptions);
          return;
        }
        setLoading("Loading...");
        try {
          const drawnNumbers: BigNumber[] = await contract.getDrawnNumbers();
          if (drawnNumbers.length === 0) {
            setLoading("No numbers drawn yet.");
            return;
          } else {
            setLoading("");
          }
          const drawnNumbersAsNumber: number[] = drawnNumbers.map((number) =>
            number.toNumber()
          );
          setDrawnNumbers((prev) => drawnNumbersAsNumber);
          setInitialFetchCompleted(true); // [1]
        } catch (err: any) {
          toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
          setDrawnNumbers((prev) => []);
          setLoading("");
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (contract && initialFetchCompleted) {
      contract.on("DrawNumber", eventHandler);
    }
    return () => {
      if (contract) {
        contract.off("DrawNumber", eventHandler);
      }
    };
  }, [initialFetchCompleted]);

  const eventHandler = async (number: BigNumber, event: Event) => {
    const luckyNumber = number.toNumber();
    if (!drawnNumbers.includes(luckyNumber)) {
      setDrawnNumbers((prev) => [...prev, luckyNumber]);
      toast.info(`New number drawn: ${luckyNumber}`, toastOptions);
    }
  };

  return (
    <>
      {drawnNumbers.length === 0 && (
        <div className="text-xl m-20 font-semibold">{loading}</div>
      )}
      {drawnNumbers.length > 0 && (
        <DrawnNumbersTable drawnNumbers={drawnNumbers}></DrawnNumbersTable>
      )}
    </>
  );
};
