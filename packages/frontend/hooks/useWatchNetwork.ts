import { deepEqual, GetNetworkResult, watchNetwork } from "@wagmi/core";
import { Dispatch, SetStateAction, useEffect } from "react";

export function useWatchNetwork(
  network: GetNetworkResult,
  setNetwork: Dispatch<SetStateAction<GetNetworkResult>>
) {
  useEffect(() => {
    watchNetwork((newNetwork: GetNetworkResult) => {
      if (!deepEqual(newNetwork, network)) {
        console.log("Captured: newNetwork", newNetwork);
        setNetwork(newNetwork);
      }
    });
  }, [network]);
}
