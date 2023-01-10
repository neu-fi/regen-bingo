import { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { MINT_PRICE } from "@/config";
import { useBingoContract } from "@/hooks/useBingoContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { errorSlicing } from "@/utils/utils";

export const BingoCardMint = () => {
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
        const tx = await contract?.mint({
          value: ethers.utils.parseEther(MINT_PRICE.toString()),
        });
        setLoading("Transaction waiting..");
        await tx.wait();
        setLoading("");
        setError("Succesfully minted");
        toast.success(
          "Succesfully minted, please check My Cards page to see!",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            theme: "light",
          }
        );
      } catch (err: any) {
        toast.error(`${errorSlicing(err.reason)}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          theme: "light",
        });
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
          {!error && !loading && <span>Mint</span>}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="ml-2 w-5 h-5 sm:w-5 sm:h-5"
        >
          <path d="M1 4.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 2H3.25A2.25 2.25 0 001 4.25zM1 7.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 5H3.25A2.25 2.25 0 001 7.25zM7 8a1 1 0 011 1 2 2 0 104 0 1 1 0 011-1h3.75A2.25 2.25 0 0119 10.25v5.5A2.25 2.25 0 0116.75 18H3.25A2.25 2.25 0 011 15.75v-5.5A2.25 2.25 0 013.25 8H7z" />
        </svg>
      </button>
    </>
  );
};
