import { useContext, useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { BingoState, useBingoContract } from "@/hooks/useBingoContract";
import { Contract } from "ethers";
import { ContractStateContext } from "@/components/Layout";
import moment from 'moment';

export const DrawnCountDown = () => {
  const bingoState = useContext(ContractStateContext);
  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);
  const [drawTimestamp, setDrawTimestamp] = useState<number | undefined>();
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now() / 1000);
  const [text, setText] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTimestamp(Date.now() / 1000), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchAndSetDrawTimestamp = async () => setDrawTimestamp(Number(await contract?.drawTimestamp()));
    fetchAndSetDrawTimestamp();
  }, [contract]);

  useEffect(() => {
    if (drawTimestamp) {
      if (bingoState === BingoState.MINT) {
        if (currentTimestamp < drawTimestamp) {
          setText("The game can start in " + moment.duration(moment.unix(drawTimestamp).diff(moment.now())).humanize() +  ".");
        } else {
          setText("The game can start anytime.");
        }
      } else if (bingoState === BingoState.DRAW) {
        setText("The game has started.");
      } else if (bingoState === BingoState.FINISHED) {
        setText("The game has ended.");
      }
    } else {
      setText("");
    }
  }, [currentTimestamp, drawTimestamp]);

  return (
    <>
      {text}
    </>
  );
};
