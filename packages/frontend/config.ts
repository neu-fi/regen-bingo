import contracts from "@/contracts/hardhat_contracts.json";

console.log("process.env.NETWORK")
console.log(process.env.NETWORK)

type NetworkDetails = {
  NETWORK_ID: number;
  NETWORK_NAME: string;
};

function getNetwork(): NetworkDetails {
  switch (process.env.NETWORK) {
    case "ethereum":
      return {
        NETWORK_ID: 1,
        NETWORK_NAME: "Ethereum",
      };
    case "goerli":
      return {
        NETWORK_ID: 5,
        NETWORK_NAME: "Goerli",
      };
    default:
      return {
        NETWORK_ID: 31337,
        NETWORK_NAME: "Hardhat",
      };
  }
}

export const NETWORK_ID = getNetwork().NETWORK_ID as number;
export const NETWORK_NAME = getNetwork().NETWORK_NAME as string;
export const CONTRACT = (contracts as any)[NETWORK_ID][0].contracts.RegenBingo;
export const CONTRACT_ADDRESS = CONTRACT.address;
export const CONTRACT_ABI  = CONTRACT.abi;
