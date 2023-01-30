/* global BigInt */

import Card, { ICard } from "@/components/Card";
import { useBingoContract } from "@/hooks/useBingoContract";
import { getToken } from "@/utils/utils";
import { Contract } from "ethers";
import { useState } from "react";
import { useSigner, useContractRead } from "wagmi";
import { getAccount, getNetwork, watchAccount, watchNetwork, watchContractEvent, GetAccountResult, GetNetworkResult, deepEqual } from '@wagmi/core'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

export default function CardList() {
  const [cards, setCards] = useState<ICard[]>([]);
  const [cardsCount, setCardsCount] = useState<number>(0);
  const [network, setNetwork] = useState<GetNetworkResult>(() => getNetwork());
  const [account, setAccount] = useState<GetAccountResult>(() => getAccount());

  const signer = useSigner();
  const contract: Contract | undefined = useBingoContract(signer.data);

  const idToCard = async (id: number) => {
    return await getToken(contract!, Number(id))
  };

  function computeCards(tokenIds: number[]) {
    let promises = tokenIds.map(idToCard);
    Promise.all(promises)
      .then((values) => {
        setCardsCount(values.length);
        setCards(values);
        return values;
      })
      .then((values) => {
        setCardsCount(values.length);
        setCards(
          values.sort(function (a, b) {   
            return a.coveredNumbersCount - b.coveredNumbersCount || Number(a.id) - Number(b.id);
          })
        );
      })
      .catch(() => {
        setCardsCount(0);
        setCards([]);
      });
  }

  const readTokensOfOwner = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokensOfOwner',
    args: [account.address],
    onSuccess(data:any) {
      setCardsCount(data.length);
      computeCards(data);
    },
    onError() {
      setCardsCount(0);
      setCards([]);
    },
    onSettled() {
      console.log("Triggered tokensOfOwner");
    },
    watch: true,
  })

  let throttleLock = false;
  const throttle = (callback: Function, cooldown: number) => {
    if (!throttleLock) {
      throttleLock = true;
      
      callback();
      
      setTimeout(() => {
        throttleLock = false;
      }, cooldown);
    }
  };
  
  watchNetwork((newNetwork) => {
    if(!deepEqual(newNetwork, network)) {
      console.log("Captured: newNetwork");
      setNetwork(newNetwork);
      throttle(readTokensOfOwner.refetch, 100);
    }
  });
  
  watchAccount((newAccount) => {
    if(!deepEqual(newAccount, account)) {
      console.log("Captured: newAccount");
      setAccount(newAccount);
      throttle(readTokensOfOwner.refetch, 100);
    }
  });

  watchContractEvent(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'Transfer',
    },
    () => {
      console.log("Captured: Transfer");
      throttle(readTokensOfOwner.refetch, 1000);
    }
  );

  watchContractEvent(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'DrawNumber',
    },
    () => {
      console.log("Captured: DrawNumber");
      throttle(readTokensOfOwner.refetch, 100);
    }
  );

  watchContractEvent(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'ClaimPrize',
    },
    () => {
      console.log("Captured: ClaimPrize");
      throttle(readTokensOfOwner.refetch, 100);
    }
  );

  return (
    <>
      { ( network.chain === undefined  || network.chain?.unsupported ) ? (
        <p className="mt-6 text-lg leading-8 font-bold text-gray-600 sm:text-center">
          Cannot connect to the network
        </p>
      ) : (
        <>
          {cardsCount == 0 && cards.length == 0 ? (
            <p className="mb-6 text-lg leading-8 text-gray-600 sm:text-center">
              You don't have any Regen Bingo cards.
            </p>
          ) : (
            /*
            <>
              <div className="bg-white rounded-2xl shadow-2xl my-4">
                <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
                  <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                    <div className="lg:col-span-2">
                      <ul
                        role="list"
                        className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0"
                      >
                        {cards.map((card) => (
                          <li key={card.id} className="sm:py-4">
                            <Card card={card}></Card>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              </>

            */
      <div className="bg-white w-full">
      <div className="mx-auto max-w-8xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8 justify-center">
        <div className="mt-6 grid grid-cols-3 gap-y-10 gap-x-6">
        {cards.map((card) => (
            <div key={card.id} className="group relative">
              <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:aspect-none lg:h-90">
              <Card card={card}></Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
          )}
        </>
      )}
    </>
  );
};
