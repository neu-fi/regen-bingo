import { BingoState, useBingoContract } from "@/hooks/useBingoContract";
import { useAccount, useSigner } from "wagmi";
import { useState, useEffect } from "react";
import { toast, ToastContentProps } from "react-toastify";
import { errorSlicing } from "@/utils/utils";
import { Contract } from "ethers";

export const DrawNumber = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const isConnected = useAccount();
  const { data: signerData } = useSigner();
  const contract: Contract | undefined = useBingoContract(signerData);

  useEffect(() => {
    if (signerData) {
      setError("");
    } else {
      setError("Please connect wallet to draw a number");
    }
    return;
  }, [signerData]);

  async function handleClick() {
    if (isConnected && contract) {
      try {
        const state = await contract.bingoState();
        if (state === BingoState.FINISHED) {
          setError("Bingo is finished");
          toast.error(`Draw is finished!`);
          return;
        }
        if (state === BingoState.MINT) {
          const tx = await contract.startDrawPeriod();
          toast.promise(tx.wait, {
            pending: "Waiting for transaction",
            success: {
              // When promise resolves, render toast and trigger the drawNumber
              render() {
                handleClick();
                return "Draw period started!";
              },
            },
            error: {
              render({ data }: ToastContentProps<any>) {
                return (<span>{errorSlicing(data.reason)}</span>) as any;
              },
            },
          });
          return;
        }
        setLoading("Waiting for approval...");
        const tx = await contract.drawNumber();
        toast.promise(tx.wait, {
          pending: "Waiting for transaction",
          success: undefined,
          error: {
            render({ data }: ToastContentProps<any>) {
              return (<span>{errorSlicing(data.reason)}</span>) as any;
            },
          },
        });
        setLoading("");
      } catch (err: any) {
        toast.error(`${errorSlicing(err.reason)}!`);
        setLoading("");
        setError("An error occured");
      }
      window.setTimeout(() => {
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
      className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center w-32 h-auto rounded-lg bg-green-2 px-4 py-1.5 text-base text-white font-semibold leading-7 shadow-sm hover:bg-green-1 hover:text-green-2 justify-center md:w-1/3 mb-6"
    >
      <span>
        {loading && !error && <span>{loading}</span>}
        {error && !loading && <span>{error}</span>}
        {!error && !loading && <span>Draw</span>}
      </span>
    </button>
  );
};
