import DrawnNumbersTable from "@/components/DrawnNumbersTable";
import { CHAIN_ID, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config";
import { useWatchContractEvent, useWatchNetwork } from "@/hooks";
import { getNetwork, GetNetworkResult } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useContractRead, useProvider } from "wagmi";

type GetDrawnNumbersProps = {};

export const GetDrawnNumbers = (props: GetDrawnNumbersProps) => {
  // States
  const [drawnNumbers, setDrawnNumbers] = useState<number[] | undefined>(
    undefined
  );
  const [message, setMessage] = useState("Loading...");

  // Web3 Hooks
  const provider = useProvider();
  const [network, setNetwork] = useState<GetNetworkResult>(() => getNetwork());

  // Throttle lock
  let throttleLock = false;

  // Contract call
  const fetchDrawnNumbers = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getDrawnNumbers",
    onSuccess(data: any) {
      console.log(data);
      setDrawnNumbers(data);
      setMessage("");
    },
    onError(error: any) {
      console.log(error);
      setDrawnNumbers(undefined);
    },
    onSettled() {
      console.log("DrawnNumber fetch completed.");
    },
  });

  // Network listener.
  // TODO: Use a global network listener and remove this.
  useWatchNetwork(network, setNetwork);

  // Side-effects
  useEffect(() => {
    // If chain is not supported, do not fetch
    if (network.chain === undefined || network.chain.unsupported) {
      setDrawnNumbers(undefined);
      setMessage("Please switch network!");
      return;
    }

    // If chain is correct, fetch
    if (network.chain && network.chain.id === CHAIN_ID) {
      if (!drawnNumbers) {
        fetchDrawnNumbers.refetch();
      } else {
        useWatchContractEvent("DrawNumber", fetchDrawnNumbers, throttleLock);
      }
    }
  });

  return (
    <>
      {!drawnNumbers && (
        <div className="text-xl m-20 font-semibold">{message}</div>
      )}
      {drawnNumbers && drawnNumbers.length === 0 && (
        <div className="text-xl m-20 font-semibold">
          No numbers are drawn, yet.
        </div>
      )}
      {drawnNumbers && drawnNumbers.length > 0 && (
        <DrawnNumbersTable drawnNumbers={drawnNumbers}></DrawnNumbersTable>
      )}
    </>
  );
};
