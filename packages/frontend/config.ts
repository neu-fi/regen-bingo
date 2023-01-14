console.log("NODE_ENV:", process.env.NODE_ENV);

export const NETWORK = process.env.NETWORK;

type NetworkDetails = {
  NETWORK_ID?: number;
  NETWORK_NAME?: string;
  CONTRACT_ADDRESS?: string;
  MINT_PRICE?: number;
};

function getNetwork(): NetworkDetails {
  let networkDetails: NetworkDetails = {};
  switch (NETWORK) {
    case "mainnet":
      networkDetails = {
        NETWORK_ID: 1,
        NETWORK_NAME: "Mainnet",
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
        MINT_PRICE: 0.1,
      };
      break;
    case "goerli":
      networkDetails = {
        NETWORK_ID: 5,
        NETWORK_NAME: "Goerli",
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
        MINT_PRICE: 0.01,
      };
      break;
    case "hardhat":
      networkDetails = {
        NETWORK_ID: 31337,
        NETWORK_NAME: "Hardhat",
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
        MINT_PRICE: 0.1,
      };
      break;
  }
  return networkDetails;
}

export const NETWORK_ID = getNetwork().NETWORK_ID as number;
export const NETWORK_NAME = getNetwork().NETWORK_NAME as string;
export const CONTRACT_ADDRESS = getNetwork().CONTRACT_ADDRESS as string;
export const MINT_PRICE = getNetwork().MINT_PRICE as number;
