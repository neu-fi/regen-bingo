import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config";
import { throttle } from "@/utils/utils";
import { watchContractEvent } from "@wagmi/core";
import { UseQueryResult } from "wagmi/dist/declarations/src/hooks/utils";
import { CHAIN_ID } from "../config";

export function useWatchContractEvent(
  eventName: string,
  callback: UseQueryResult<unknown, Error>,
  throttleLock: boolean
) {
  return watchContractEvent(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: eventName,
      chainId: CHAIN_ID,
    },
    () => {
      console.log(`Captured: ${eventName}`);
      throttle(callback.refetch, throttleLock);
    }
  );
}
