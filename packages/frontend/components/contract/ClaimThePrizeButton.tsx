import { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { MINT_PRICE } from "@/config";
import { useBingoContract } from "@/hooks/useBingoContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing, toastOptions } from "@/utils/utils";

export const ClaimThePrizeButton = (props: {
  tokenId: string
}) => {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const { isConnected } = useAccount();
  const { data: signerData } = useSigner();

  const contract = useBingoContract(signerData);

  useEffect(() => {
    if (isConnected) {
      setError("");
    } else {
      setError("Please connect wallet to mint");
    }
    return;
  }, [isConnected]);

  async function mintBingoCard() {
    if (isConnected) {
      try {
        setLoading("Approval waiting..");
        const tx = await contract?.claimPrize(props.tokenId);
        setLoading("Transaction waiting..");
        await tx.wait();
        setLoading("");
        setError("Succesfully minted");
        toast.success(
          "Succesfully minted, please check My Cards page to see!",
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
          {!error && !loading && <span>💰 Claim Prize</span>}
        </span>
      </button>
    </>
  );
};
