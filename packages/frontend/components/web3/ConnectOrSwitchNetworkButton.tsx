import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { watchNetwork, getNetwork } from "@wagmi/core";

export const ConnectOrSwitchNetworkButton = () => {
  const [network, setNetwork] = useState(() => getNetwork());
  watchNetwork((network) => setNetwork(network));

  return network.chain && !network.chain.unsupported ? (
    <ConnectButton chainStatus="none" />
  ) : (
    <ConnectButton chainStatus="name" />
  );
};
