import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { useContract } from "wagmi";
import { toast } from "react-toastify";

export const enum BingoState {
  MINT,
  DRAW,
  END,
}

export const useBingoContract = (providerOrSigner: any) => {
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    signerOrProvider: providerOrSigner,
  });

  if (!contract) {
    toast.error("Contract cannot found");
    return;
  }

  return contract;
};
