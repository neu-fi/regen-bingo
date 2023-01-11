import React, { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import DrawnNumbersTable, {
  ITableElement,
} from "@/components/DrawnNumbersTable";
import { useBingoContract } from "@/hooks/useBingoContract";
import { BigNumber, Event } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing, toastOptions } from "@/utils/utils";

type GetDrawnNumbersProps = {
  onDrawnNumbersUpdate: (drawnNumbers: ITableElement[]) => void;
};

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
      const filter = contract?.filters.DrawNumber();
      if (!filter) {
        console.log("Events cannot found");
        return;
      }
      const events = await contract?.queryFilter(filter);
      events?.forEach((event) => {
        eventHandler(event.args?.number, event);
      });
    } catch (err: any) {
      toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
      setDrawnNumbers([]);
      setLoading("");
    }
    if (drawnNumbers.length === 0) {
      setLoading("No numbers drawn yet.");
    } else {
      setLoading("");
    }
    props.onDrawnNumbersUpdate(updatedDrawnNumbers);
  };

  const eventHandler = async (number: BigNumber, event: Event) => {
    const block = await event.getBlock();
    const blockTimestamp = block?.timestamp;
    const luckyNumber = event.args?.number.toNumber();
    const timestamp = new Date(blockTimestamp * 1000).toString();
    const tx = event.transactionHash;
    const newNumber: ITableElement = {
      drawnNumber: luckyNumber,
      timestamp: timestamp,
      txHash: tx,
    };
    if (!luckyNumbers.includes(luckyNumber)) {
      luckyNumbers.push(luckyNumber);
      setDrawnNumbers((prev) => [...prev, newNumber]);
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
