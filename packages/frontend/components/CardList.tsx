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
  const [cardsCount, setCardsCount] = useState<number | undefined>(undefined);
  const [cardsMap, setCardsMap] = useState<Map<number, ICard>>(
    new Map<number, ICard>()
  );

  const networkState: boolean = useContext(NetworkContext);

  const account = useAccount();
  const signer = useSigner();
  const contract: Contract | undefined = useBingoContract(signer.data);

  useEffect(() => {
    const getBalance = async () => {
      if (networkState && account?.address) {
        try {
          const balance: BigNumber = await contract!.balanceOf(account.address);
          return Number(balance);
        } catch (err) {
          console.log(err);
        }
      }
    };
    setCardsMap(new Map<number, ICard>());

    if (!contract) {
      return;
    }

    getBalance().then((balance) => {
      console.log(balance);
      setCardsCount((oldBalance) => balance);
    });
  }, [contract, account.address, networkState, trigger]);

  useEffect(() => {
    const fetchCardList = () => {
      for (let i = 0; i < cardsCount!; i++) {
        console.log("fetching card", i, "of", account.address!);
        contract!
          .tokenOfOwnerByIndex(account.address, i)
          .then((tokenId: BigNumber) => {
            if (!cardsMap.get(Number(tokenId))) {
              getToken(contract!, Number(tokenId)).then((card) =>
                setCardsMap((cardsMap) => new Map(cardsMap.set(Number(tokenId), card)))
              );
            }
          });
      }
    };

    // Guard clauses
    if (!contract) {
      return;
    }
    // console.log(cardsCount);
    fetchCardList();
  }, [cardsCount]);

  return (
    <>
      {!networkState ? (
        <p className="mt-6 text-lg leading-8 font-bold text-gray-600 sm:text-center">
          Please switch network!
        </p>
      ) : (
        <>
          {cardsCount == 0 ? (
            <p className="mb-6 text-lg leading-8 text-gray-600 sm:text-center">
              You don't have any Regen Bingo Cards.
            </p>
          ) : (
            <>
              {cardsCount && (
                <>
                  <p className="mb-6 text-lg leading-8 text-gray-600 sm:text-center">
                    Displaying {cardsMap.size} out of {cardsCount} cards.
                  </p>
                </>
              )}

              <div className="bg-white rounded-2xl shadow-2xl my-4">
                <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
                  <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                    <div className="lg:col-span-2">
                      <ul
                        role="list"
                        className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0"
                      >
                        {[...cardsMap.values()].map((card) => (
                          <li key={card.id} className="sm:py-4">
                            <Card card={card}></Card>
                          </li>
                        ))}
                      </ul>
                      {cardsMap.size !== cardsCount && (
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{
                              margin: "auto",
                              display: "block",
                            }}
                            shapeRendering="auto"
                            width="200px"
                            height="200px"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="xMidYMid"
                          >
                            <path
                              d="M10 50A40 40 0 0 0 90 50A40 43.4 0 0 1 10 50"
                              fill="#d4ecc9"
                              stroke="none"
                            >
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                dur="1.1764705882352942s"
                                repeatCount="indefinite"
                                keyTimes="0;1"
                                values="0 50 51.7;360 50 51.7"
                              ></animateTransform>
                            </path>
                          </svg>
                        </div>
                      )}
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
