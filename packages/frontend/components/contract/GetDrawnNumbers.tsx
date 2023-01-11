import React, { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";
import { useBingoContract } from "@/hooks/useBingoContract";
import { BigNumber, Event } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing, toastOptions } from "@/utils/utils";

type GetDrawnNumbersProps = {};

export const GetDrawnNumbers = (props: GetDrawnNumbersProps) => {
  const [drawnNumbers, setDrawnNumbers] = useState<ITableElement[]>([]);
  const [loading, setLoading] = useState("");
  let luckyNumbers: Number[] = [];

  const provider = useProvider();
  const contract = useBingoContract(provider);

  useEffect(() => {
    getDrawnNumbers();
    if (contract) {
      contract.on("DrawNumber", eventHandler);
    }
    return () => {
      if (contract) {
        contract.off("DrawNumber", eventHandler);
      }
    };
  }, []);

  const getDrawnNumbers = async () => {
    setLoading("Loading...");
    let updatedDrawnNumbers: ITableElement[] = [];
    try {
      for (var i = 1; i <= 90; i++) {
        const isDrawn = await contract!.isDrawn(i);
        if (isDrawn) {
          updatedDrawnNumbers.push({ drawnNumber: i });
        }
      }
      setDrawnNumbers(updatedDrawnNumbers);
      if (drawnNumbers.length === 0) {
        setLoading("No numbers drawn yet.");
      } else {
        setLoading("");
      }
    } catch (err: any) {
      toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
      setDrawnNumbers([]);
      setLoading("");
    }
  };

  const eventHandler = async (number: BigNumber, event: Event) => {
    const luckyNumber = event.args?.number.toNumber();
    if (!luckyNumbers.includes(luckyNumber)) {
      luckyNumbers.push(luckyNumber);
      setDrawnNumbers((prev) => [...prev, { drawnNumber: luckyNumber }]);
    }
  };

  return (
    <>
      {loading && <div className="text-xl m-20 font-semibold">{loading}</div>}
      {!loading && (
        <DrawnNumbersTable drawnNumbers={drawnNumbers}></DrawnNumbersTable>
      )}
    </>
  );
};
