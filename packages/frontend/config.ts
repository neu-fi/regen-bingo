import contracts from "@/contracts/hardhat_contracts.json";
import { chain, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

let supportedChain = (() => {
  switch (process.env.NEXT_PUBLIC_NETWORK) {
    case "ethereum":
      return chain.mainnet;
    case "goerli":
      return chain.goerli;
    default:
      return chain.hardhat;
  }
})();

let { chains, provider } = configureChains(
  [supportedChain],
  [publicProvider()]
);

export const CHAIN_ID = supportedChain.id;
export const CHAIN_NAME = supportedChain.name;
export const CHAINS = chains;
export const PROVIDER = provider;

let regenBingo = (contracts as any)[CHAIN_ID][0].contracts.RegenBingo;
export const CONTRACT_ADDRESS = regenBingo.address;
export const CONTRACT_ABI = regenBingo.abi;
