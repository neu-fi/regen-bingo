import { useEffect, useState, useContext } from "react";
import { useAccount, useSigner } from "wagmi";
import { useBingoContract } from "@/hooks/useBingoContract";
import { ethers } from "ethers";
import { toast, ToastContentProps } from "react-toastify";
import { errorSlicing } from "@/utils/utils";
import { NetworkContext } from "@/components/Layout";

export const BingoCardMint = () => {
  const [mintPrice, setMintPrice] = useState(0);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const networkState: boolean = useContext(NetworkContext);

  const account = useAccount();
  const { data: signerData } = useSigner();

  const contract = useBingoContract(signerData);

  useEffect(() => {
    if (!networkState) {
      return;
    }
    const getMintPrice = async () => {
      try {
        const fetchedMintPrice = await contract!.mintPrice();
        return fetchedMintPrice;
      } catch (e) {
        console.error(e);
      }
    };
    if (account.isConnected && contract) {
      setError("");
      getMintPrice().then((mintPrice) => {
        setMintPrice(mintPrice);
      });
    } else {
      setError("Please connect wallet to mint");
    }
    return;
  }, [contract, account.isConnected, networkState]);

  async function mintBingoCard() {
    if (account.isConnected) {
      try {
        setLoading("Waiting for approval...");
        const tx = await contract?.mint(account.address, 1, {
          value: mintPrice,
        });
        setLoading("");
        toast.promise(tx.wait, {
          pending: "Waiting for transaction",
          success: {
            render() {
              return "Minted a new Regen Bingo Card!";
            },
          },
          error: {
            render({ data }: ToastContentProps<any>) {
              return (<span>{errorSlicing(data.reason)}</span>) as any;
            },
          },
        });
      } catch (err: any) {
        toast.error(`${errorSlicing(err.reason)}!`);
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
          {!error && !loading && (
            <span>
              Mint for {mintPrice && ethers.utils.formatEther(mintPrice)} ETH
            </span>
          )}
        </span>
      </button>
    </>
  );
};
