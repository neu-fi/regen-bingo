import { BGBlur, Header, Footer } from "@/components";
import { BingoState, useBingoContract } from "@/hooks/useBingoContract";
import { BigNumber, Contract } from "ethers";
import Link from "next/link";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProvider } from "wagmi";
import { getNetwork, GetNetworkResult, watchNetwork } from "@wagmi/core";
import { CHAIN_ID } from "@/config";

type LayoutProps = {};

// Contexts
export const ContractStateContext = createContext<BingoState | undefined>(
  undefined
);
export const WinnerCardContext = createContext<number | undefined>(undefined);
export const NetworkContext = createContext<boolean>(false);

function Layout(props: PropsWithChildren<LayoutProps>) {
  // States
  const [bingoState, setBingoState] = useState<BingoState>();
  const [winnerCardId, setWinnerCardId] = useState<number>();
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState<boolean>(false);
  const [initialFetchCompleted, setInitialFetchCompleted] = useState(false);
  const [trigger, setTrigger] = useState<Event>();

  // Web3 Hooks
  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);
  const [network, setNetwork] = useState<GetNetworkResult>(() => getNetwork());
  watchNetwork((newNetwork) => {
    if (newNetwork.chain?.id != network.chain?.id) {
      setNetwork(newNetwork)
    }
  });

  useEffect(() => {
    if (network.chain?.id == CHAIN_ID) {
      setIsOnCorrectNetwork(true);
    }

    const contractState = async () => {
      try {
        const state = await contract!.bingoState();
        return state;
      } catch (error) {
        console.log(error);
      }
    };
    if (!contract) {
      return;
    }

    if (!initialFetchCompleted || trigger) {
      contractState().then((state) => {
        if (state !== undefined) {
          setBingoState((prevState) => {
            if (prevState === undefined && state !== undefined) {
              setInitialFetchCompleted(true);
            }
            return state;
          });
        }
      });
    }
  }, [trigger, network.chain?.id]);

  useEffect(() => {
    if (contract) {
      contract.on("DrawStarted", drawStartedHandler);
      contract.on("ClaimPrize", gameFinishedHandler);
    }
    return () => {
      if (contract) {
        contract.off("DrawStarted", drawStartedHandler);
        contract.off("ClaimPrize", gameFinishedHandler);
      }
    };
  }, [initialFetchCompleted, trigger]);

  async function drawStartedHandler(event: Event) {
    toast.info(`Draw has been started, good luck!`);
    setTrigger((trigger) => event);
  }

  async function gameFinishedHandler(
    id: BigNumber,
    winnerAddress: string,
    event: Event
  ) {
    const CustomToastWithLink = (id: BigNumber) => {
      return (
        <div>
          Looks like we have a winner, congratulations!{" "}
          <Link
            href={`/cards/${id}`}
            className="text-green-4"
            target="_blank"
            rel="noreferrer"
          >
            Check the card
          </Link>
        </div>
      );
    };
    setWinnerCardId(Number(id));
    toast.info(CustomToastWithLink(id));
    setTrigger((trigger) => event);
  }

  return (
    <div className="flex flex-col h-screen">
      <BGBlur type={"header"} colors={["#ffcc01", "#00e2ab"]}></BGBlur>
      <Header></Header>
      <main className="flex-grow">
        <NetworkContext.Provider value={isOnCorrectNetwork}>
          <ContractStateContext.Provider value={bingoState}>
            <WinnerCardContext.Provider value={winnerCardId!}>
              {props.children}
            </WinnerCardContext.Provider>
          </ContractStateContext.Provider>
        </NetworkContext.Provider>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default Layout;
