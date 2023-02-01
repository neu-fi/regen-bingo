import { Footer, Header } from "@/components";
import { CHAIN_ID, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config";
import { BingoState } from "@/hooks/useBingoContract";
import { getNetwork, GetNetworkResult, watchNetwork } from "@wagmi/core";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useContractRead } from "wagmi";
import { useWatchContractEvent } from "../hooks/useWatchContractEvent";
import { useWatchNetwork } from "../hooks/useWatchNetwork";

type LayoutProps = {};

// Contexts
export const BingoStateContext = createContext<BingoState | undefined>(
  undefined
);
export const WinnerCardContext = createContext<number | undefined>(undefined);
export const NetworkContext = createContext<boolean>(false);

function Layout(props: PropsWithChildren<LayoutProps>) {
  // States
  const [bingoState, setBingoState] = useState<BingoState>();
  const [winnerCardId, setWinnerCardId] = useState<number>();
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState<boolean>(false);

  // Web3 Hooks
  const [network, setNetwork] = useState<GetNetworkResult>(() => getNetwork());
  useWatchNetwork(network, setNetwork);

  // Throttle lock
  let throttleLock: boolean = false;

  const getBingoState = useContractRead({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "bingoState",
    args: [],
    onSuccess: (data: any) => {
      setBingoState(data);
    },
    onError: (error: any) => {
      toast.error("Coudln't fetch bingo state!");
      console.log("Error:", error);
    },
    onSettled: () => {
      console.log("Bingo State fetched!");
    },
    watch: true,
  });

  useWatchContractEvent("DrawStarted", getBingoState, throttleLock);
  useEffect(() => {
    if (network.chain?.id == CHAIN_ID) {
      setIsOnCorrectNetwork(true);
    }
    getBingoState.refetch();
  }, [network.chain?.id]);


  // TODO: Migrate to useWatchContractEvent
  // async function drawStartedHandler(event: Event) {
  //   toast.info(`Draw has been started, good luck!`);
  //   setTrigger((trigger) => event);
  // }

  // async function gameFinishedHandler(
  //   id: BigNumber,
  //   winnerAddress: string,
  //   event: Event
  // ) {
  //   const CustomToastWithLink = (id: BigNumber) => {
  //     return (
  //       <div>
  //         Looks like we have a winner, congratulations!{" "}
  //         <Link
  //           href={`/cards/${id}`}
  //           className="text-green-4"
  //           target="_blank"
  //           rel="noreferrer"
  //         >
  //           Check the card
  //         </Link>
  //       </div>
  //     );
  //   };
  //   setWinnerCardId(Number(id));
  //   toast.info(CustomToastWithLink(id));
  //   setTrigger((trigger) => event);
  // }

  return (
    <div className="flex flex-col h-screen">
      <NetworkContext.Provider value={isOnCorrectNetwork}>
        <BingoStateContext.Provider value={bingoState}>
          <WinnerCardContext.Provider value={winnerCardId!}>
            <Header></Header>
            <main className="flex-grow bg-green-5">{props.children}</main>
          </WinnerCardContext.Provider>
        </BingoStateContext.Provider>
      </NetworkContext.Provider>
      <Footer></Footer>
    </div>
  );
}

export default Layout;
