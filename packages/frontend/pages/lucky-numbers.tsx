import Head from "next/head";
import { DrawNumber } from "@/components/contract/DrawNumber";
import { GetDrawnNumbers } from "@/components/contract/GetDrawnNumbers";
import { useContext } from "react";
import { ContractStateContext, NetworkContext } from "@/components/Layout";
import { BingoState } from "@/hooks/useBingoContract";

type DrawnNumbersProps = {};

export default function DrawnNumbers(props: DrawnNumbersProps) {
  const bingoState = useContext(ContractStateContext);
  const networkState = useContext(NetworkContext);
  return (
    <>
      <Head>
        <title>Drawn Numbers</title>
      </Head>
      <div className="relative flex px-6 lg:px-8 justify-center">
        <div className="max-w-full mt-10 pb-0 flex justify-center">
          <div className="row-span-full mt-8">
            <div className="flex flex-wrap justify-center items-center flex-col">
              <h3 className="text-xl font-bold text-green-4 tracking-tight sm:text-center sm:text-4xl">
                Lucky Numbers
              </h3>
              <GetDrawnNumbers />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-4 relative flex justify-center">
        {bingoState !== BingoState.FINISHED && networkState && <DrawNumber />}
      </div>
    </>
  );
}
