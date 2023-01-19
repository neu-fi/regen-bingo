import Card, { ICard } from "@/components/Card";
import { useBingoContract } from "@/hooks/useBingoContract";
import { errorSlicing, getToken, svg } from "@/utils/utils";
import { Contract } from "ethers";
import { PropsWithChildren, useEffect, useState, useContext } from "react";
import { useSigner, useAccount } from "wagmi";
import { toast } from "react-toastify";
import { toastOptions } from "../utils/utils";
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
  const [cards, setCards] = useState<ICard[]>();
  const [retry, setRetry] = useState<boolean>(false);
  const [isNoCardsMinted, setIsNoCardsMinted] = useState<boolean>(true);
  const [sort, setSort] = useState<SortType>({ sort: "desc", key: "matches" });

  const networkState: boolean = useContext(NetworkContext);

  const account = useAccount();
  const { isConnected } = useAccount();
  const signer = useSigner();
  const contract: Contract | undefined = useBingoContract(signer.data);

  useEffect(() => {
    if (!networkState) {
      return;
    }

    async function fetchCardsOwnedByUser() {
      if (!account.isConnected) {
        toast.error("Please connect your wallet!", toastOptions);
        return;
      }
      if (!contract) {
        toast.error("Contract not found!", toastOptions);
        return;
      }

      try {
        const balance = await contract!.balanceOf(account.address!);
        const balanceOfUser: Number = Number(balance);

        if (balanceOfUser === 0) {
          setIsNoCardsMinted(true);
          return;
        }

        setIsNoCardsMinted(false);
        let fetchedCards: ICard[] = [];
        for (let i = 0; i < balanceOfUser; i++) {
          const tokenId: string = (
            await contract!.tokenOfOwnerByIndex(account.address, i)
          )._hex.toString();
          const card: ICard = await getToken(contract, tokenId);
          fetchedCards.push(card);
        }
        return fetchedCards;
      } catch (err: any) {
        console.log(err);
        if (!(err instanceof TypeError)) {
          toast.error(`${errorSlicing(err.reason)}!`, toastOptions);
        } else {
          window.setTimeout(() => {
            setRetry(true);
          }, 1);
        }
      }
    }
    setRetry(false);
    if (isConnected && contract) {
      fetchCardsOwnedByUser().then((fetchedCards) => {
        if (fetchedCards && fetchedCards.length > 0) {
          setCards(sortCards(fetchedCards!));
        } else {
          setIsNoCardsMinted(true);
        }
      });
    }
  }, [networkState, retry, trigger]);

  return (
    <>
      {!networkState ? (
        <p className="mt-6 text-lg leading-8 font-bold text-gray-600 sm:text-center">
          Please switch network!
        </p>
      ) : (
        <>
          {isNoCardsMinted ? (
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
              You don't have any Regen Bingo Cards.
            </p>
          ) : (
            <>
              {cards ? (
                <div className="bg-white rounded-2xl shadow-2xl my-4">
                  <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
                    <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                      <div className="lg:col-span-2">
                        <ul
                          role="list"
                          className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0"
                        >
                          {cards &&
                            cards!.map((card) => (
                              <li key={card.id} className="sm:py-4">
                                <Card card={card}></Card>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
