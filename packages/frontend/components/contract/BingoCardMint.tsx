import { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { useBingoContract } from "@/hooks/useBingoContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing, toastOptions } from "@/utils/utils";

export const BingoCardMint = () => {
  const [mintPrice, setMintPrice] = useState(0);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const { isConnected } = useAccount();
  const { data: signerData } = useSigner();

  const contract = useBingoContract(signerData);

  useEffect(() => {
    if (isConnected && contract) {
      setError("");
      (async () => {
        try {
          setMintPrice(await contract.mintPrice())
        } catch (e) {
          console.error(e)
        }
      })();
    } else {
      setError("Please connect wallet to mint");
    }
    return;
  }, [contract, isConnected]);

  async function mintBingoCard() {
    if (isConnected) {
      try {
        setLoading("Waiting for approval...");
        const tx = await contract?.mint({
          value: mintPrice
        });
        setLoading("Transaction waiting..");
        await tx.wait();
        setLoading("");
        setError("Succesfully minted");
        toast.success(
          "Minted a new Regen Bingo Card!",
          toastOptions
        );
      } catch (err: any) {
        toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
        setError("An error occured");
      }
      await window.setTimeout(() => {
        setError("");
        setLoading("");
      }, 2000);
    } else {
      setError("Please connect a wallet!");
    }
  }

  return (
    <>
      <button
        disabled={loading.length > 0 || error.length > 0}
        onClick={() => {
          mintBingoCard();
        }}
        className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center w-auto rounded-lg bg-green-2 px-4 py-1.5 text-base text-white font-semibold leading-7 shadow-sm hover:bg-green-1"
      >
        <span>
          {loading && !error && <span>{loading}</span>}
          {error && <span>{error}</span>}
          {!error && !loading && <span>Mint for {ethers.utils.formatEther(mintPrice)} ETH</span>}
        </span>
      </button>
    </>
  );
};
