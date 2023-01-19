import { useContext, useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { useBingoContract } from "@/hooks/useBingoContract";
import { timestampToCountdown, toastOptions } from "@/utils/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import { errorSlicing } from "@/utils/utils";
import { Contract } from "ethers";
import { getNetwork, watchNetwork } from "@wagmi/core";
import { NetworkContext } from "@/components/Layout";

export const DrawnCountDown = () => {
  const [remainingTime, setRemainingTime] = useState<number>();
  const [drawTimestamp, setTimeStamp] = useState<number>(0);

  const networkState = useContext(NetworkContext);

  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  const [network, setNetwork] = useState(() => getNetwork());
  watchNetwork((network) => setNetwork(network));

  function changeRemaining() {
    const diff = drawTimestamp - Math.floor(Date.now() / 1000);
    setRemainingTime(diff);
  }

  useEffect(() => {
    if (!networkState) {
      return;
    }
    async function getDrawTime() {
      try {
        if (!contract) {
          return;
        }
        const drawTime = Number(await contract.drawTimestamp());
        setTimeStamp(drawTime);
      } catch (err: any) {
        console.log(err);
        toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
      }
    }

    if (!network.chain) {
      return;
    }

    if (!drawTimestamp) {
      getDrawTime();
    }
    const interval = setInterval(() => {
      changeRemaining();
    }, 1000);
    return () => clearInterval(interval);
  }, [networkState]);

  return (
    <>
      {network.chain && !network.chain.unsupported ? (
        <>
          {remainingTime ? (
            <>
              {remainingTime > 0 ? (
                <>
                  Numbers will be drawn in
                  <span className="text-green-4">
                    {timestampToCountdown(remainingTime)}
                  </span>
                </>
              ) : (
                <span>
                  Lucky numbers can be drawn!{" "}
                  <Link href="my-cards" className="text-yellow-1">
                    <span>Check your cards now.</span>
                  </Link>
                </span>
              )}
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
