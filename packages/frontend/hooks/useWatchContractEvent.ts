import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config";
import { throttle } from "@/utils/utils";
import { watchContractEvent } from "@wagmi/core";
import { UseQueryResult } from "wagmi/dist/declarations/src/hooks/utils";
import { CHAIN_ID } from "../config";
import { Event } from "@wagmi/core/dist/declarations/src/types/contracts";

export function useWatchContractEvent(
  eventName: string,
  callback: Function,
  throttleLock: boolean,
  callbackArgs: unknown[] = []
) {
  return watchContractEvent(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: eventName,
      chainId: CHAIN_ID,
    },
    (...args: [...args: unknown[], event: Event<any>]) => {
      const event: Event<any> = [...args].pop() as Event<any>;
      console.log(`Captured: ${eventName}`);
      throttle(callback, throttleLock, [...callbackArgs!, event.args]);
    }
  );
}
