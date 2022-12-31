import { useEffect, useState } from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import { CONTRACT_ADDRESS, MINT_COST } from "@/config";
import { regenBingoABI } from "@/contracts/regen_bingo_abi";

export const BingoCardMint = () => {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const { isConnected } = useAccount();
  const { data: signerData } = useSigner();

  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: regenBingoABI,
    signerOrProvider: signerData,
  });

  useEffect(() => {
    if (isConnected) {
      setError("");
    } else {
      setError("Connect wallet to mint");
    }
    return;
  }, [isConnected]);

  async function mintBingoCard() {
    if (isConnected) {
      try {
        setLoading("Approval waiting..");
        const tx = await contract?.mint({
          value: MINT_COST,
        });
        setLoading("Transaction waiting..");
        await tx.wait();
        setLoading("");
        setError("");
      } catch (err: any) {
        console.log(err);
        setError("An error occured");
        await window.setTimeout(() => {
          setError("");
          setLoading("");
        }, 1000);
      }
    } else {
      setError("Please connect a wallet!");
    }
  }

  return (
    <button
      disabled={loading.length > 0 || error.length > 0}
      onClick={() => {
        mintBingoCard();
      }}
      className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
    >
      <img src=""></img>
      <span className="mr-4">
        {loading && !error && <span>{loading}</span>}
        {error && <span>{error}</span>}
        {!error && !loading && <span>Mint with wallet</span>}
      </span>
      <span className="text-indigo-200" aria-hidden="true">
        &rarr;
      </span>
    </button>
  );
};
