import { CONTRACT_ADDRESS } from "../config"
import { regenBingoABI } from "../contracts/regen_bingo_abi"
import { useContract } from "wagmi"

export const useBingoContract = (providerOrSigner : any) => {
    const contract = useContract({
        address: CONTRACT_ADDRESS,
        abi: regenBingoABI,
        signerOrProvider: providerOrSigner,
    })
    if(!contract){
        console.error("Contract cannot found")
        return
    }
    return contract;
}
