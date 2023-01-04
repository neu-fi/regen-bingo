import { useBingoContract } from "@/hooks/useBingoContract";
import { useAccount, useSigner } from "wagmi";
import { useState, useEffect } from "react";

export const DrawNumber = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const isConnected = useAccount();
  const { data: signerData } = useSigner();
  const contract = useBingoContract(signerData);

  useEffect(() => {
    if (signerData) {
      setError("");
    } else {
      setError("Please connect wallet to draw a number");
    }
    return;
  }, [signerData]);

  async function handleClick() {
    if (isConnected) {
      try {
        setLoading("Approval waiting..");
        const tx = await contract?.drawNumber();
        setLoading("Transaction waiting..");
        await tx.wait();
        setLoading("");
        setError("Number Drawn Succesfully");
      } catch (err: any) {
        console.log(err);
        setLoading("");
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
    <button
      disabled={loading.length > 0 || error.length > 0}
      onClick={() => {
        handleClick();
      }}
      className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center w-32 h-12 rounded-lg bg-green-2 px-4 py-1.5 text-base text-white font-semibold leading-7 shadow-sm hover:bg-green-1 justify-center md:w-1/3 mb-6"
    >
      <span>
        {loading && !error && <span>{loading}</span>}
        {error && !loading && <span>{error}</span>}
        {!error && !loading && <span>Draw</span>}
      </span>
    </button>
  );
};
