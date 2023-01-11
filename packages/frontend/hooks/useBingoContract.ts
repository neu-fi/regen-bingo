import { CONTRACT_ADDRESS, NETWORK_ID, NETWORK } from "../config";
import { regenBingoABI } from "../contracts/regen_bingo_abi";
import { useContract } from "wagmi";
import contracts from "@/contracts/hardhat_contracts.json";

export const useBingoContract = (providerOrSigner: any) => {
  let contractAddress;
  let contractABI;

  if (NETWORK === "hardhat") {
    const chainId = Number(NETWORK_ID);
    const allContracts = contracts as any;
    const hardhatABI = allContracts[chainId][0].contracts.RegenBingo.abi;
    const hardhatAddress =
      allContracts[chainId][0].contracts.RegenBingo.address;
    contractAddress = hardhatAddress;
    contractABI = hardhatABI;
  } else {
    contractAddress = CONTRACT_ADDRESS;
    contractABI = regenBingoABI;
  }

  const contract = useContract({
    address: contractAddress,
    abi: contractABI,
    signerOrProvider: providerOrSigner,
  });

  if (!contract) {
    console.error("Contract cannot found");
    return;
  }

  return contract;
};
