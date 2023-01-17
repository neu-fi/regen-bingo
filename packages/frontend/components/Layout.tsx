import { BGBlur, Header, Footer } from "@/components";
import { BingoState, useBingoContract } from "@/hooks/useBingoContract";
import { BigNumber, Contract } from "ethers";
import Link from "next/link";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProvider } from "wagmi";

type LayoutProps = {};

export const ContractStateContext = createContext<BingoState | undefined>(
  undefined
);

export const WinnerCardContext = createContext<string | undefined>(undefined);

function Layout(props: PropsWithChildren<LayoutProps>) {
  const [bingoState, setBingoState] = useState<BingoState>();
  const [winnerCardId, setWinnerCardId] = useState<string>();
  const [initialFetchCompleted, setInitialFetchCompleted] = useState(false);
  const [trigger, setTrigger] = useState<Event>();

  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  useEffect(() => {
    console.log("triggerOnUseEffect", trigger);
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
            console.log("prevState", prevState);
            console.log("state", state);
            if (prevState === undefined && state !== undefined) {
              setInitialFetchCompleted(true);
            }
            return state;
          });
        }
      });
    }
  }, [trigger]);

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
    setWinnerCardId(id._hex.toString());
    toast.info(CustomToastWithLink(id));
    setTrigger((trigger) => event);
  }

  return (
    <div className="flex flex-col h-screen">
      <BGBlur type={"header"} colors={["#ffcc01", "#00e2ab"]}></BGBlur>
      <Header></Header>
      <main className="flex-grow">
        <ContractStateContext.Provider value={bingoState}>
          <WinnerCardContext.Provider value={winnerCardId!}>
            {props.children}
          </WinnerCardContext.Provider>
        </ContractStateContext.Provider>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default Layout;
