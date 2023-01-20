import Card, { ICard } from "@/components/Card";
import { useBingoContract } from "@/hooks/useBingoContract";
import { getToken } from "@/utils/utils";
import { BigNumber, Contract } from "ethers";
import { PropsWithChildren, useEffect, useState, useContext } from "react";
import { useSigner, useAccount } from "wagmi";
import { NetworkContext } from "@/components/Layout";

type CardListProps = {
  trigger?: Event;
};

type SortType = {
  sort: "asc" | "desc";
  key: "matches" | "id";
};

function sortCards(
  cards: ICard[],
  type: SortType = { sort: "desc", key: "matches" }
): ICard[] {
  if (type.key === "matches") {
    // SORT BY MATCHES
    return cards.sort((a, b) => {
      const aMatches = a.coveredNumbersCount;
      const bMatches = b.coveredNumbersCount;
      return type.sort === "asc" ? aMatches - bMatches : bMatches - aMatches;
    });
  }
  return cards;
}

export default function CardList(props: PropsWithChildren<CardListProps>) {
  const { trigger } = props;
  const [cardsCount, setCardsCount] = useState(0);
  const [cardsMap, setCardsMap] = useState(new Map<string, ICard>());

  const networkState: boolean = useContext(NetworkContext);

  const account = useAccount();
  const { isConnected } = useAccount();
  const signer = useSigner();
  const contract: Contract | undefined = useBingoContract(signer.data);

  useEffect(() => {
    if (networkState && isConnected && contract?.provider && account?.address) {
      contract.balanceOf(account.address).then((balance: BigNumber) => {
        setCardsCount(Number(balance));
      })
    }
  }, [contract, isConnected, networkState, trigger]);

  useEffect(() => {
    for (let i = 0; i < cardsCount; i++) {
      console.log("looking index:", i)
      contract!.tokenOfOwnerByIndex(account.address, i).then((bigNumber: BigNumber) => {
        const tokenId: string = bigNumber._hex.toString();
        if (!cardsMap.get(tokenId)) {
          console.log("setting i:", i)
          getToken(contract!, tokenId).then((card) => setCardsMap(cardsMap => new Map(cardsMap.set(tokenId, card))));
        }
      })
    }

  }, [cardsCount]);

  return (
    <>
      {!networkState ? (
        <p className="mt-6 text-lg leading-8 font-bold text-gray-600 sm:text-center">
          Please switch network!
        </p>
      ) : (
        <>
          {cardsMap.size == 0 ? (
            <p className="mb-6 text-lg leading-8 text-gray-600 sm:text-center">
              You don't have any Regen Bingo Cards.
            </p>
          ) : (
            <>
              <p className="mb-6 text-lg leading-8 text-gray-600 sm:text-center">
                Displaying {cardsMap.size} out of {cardsCount} cards.
              </p>
              <div className="bg-white rounded-2xl shadow-2xl my-4">
                <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
                  <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                    <div className="lg:col-span-2">
                      <ul
                        role="list"
                        className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0"
                      >
                        {
                          [...cardsMap.values()].map((card, index) => (
                            <li key={card.id} className="sm:py-4">
                              <Card card={card}></Card>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
