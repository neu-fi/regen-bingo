import React from "react";
import { useRouter } from "next/router";
import Card, { ICard } from "@/components/Card";
import { useBingoContract } from "@/hooks/useBingoContract";
import { useProvider } from "wagmi";
import { Contract } from "ethers";
import { getToken } from "@/utils/utils";
import { useEffect } from "react";

type CardProps = {};

function Cards(props: CardProps) {
  // Router
  const router = useRouter();
  const { id } = router.query as unknown as { id: number };
  // States
  const [loading, setLoading] = React.useState<string | null>(null);
  const [card, setCard] = React.useState<ICard>();

  // Contract
  const provider = useProvider();
  const contract: Contract | undefined = useBingoContract(provider);

  useEffect(() => {
    getTokenURI(id);
  }, [id]);

  const getTokenURI = async (tokenId: number) => {
    setLoading("Loading...");
    if (contract) {
      try {
        const card: ICard = await getToken(contract, tokenId);
        setCard(card as ICard);
        setLoading(null);
      } catch (err) {
        console.log("Error!", err);
        setLoading("Couldn't fetch token data, try again later!");
      }
    }
  };

  return (
    <>
      <div className="relative flex px-6 lg:px-8 justify-center">
        <div className="flex mt-10 justify-center">
          <div>
            {loading ? (
              <div className="text-2xl font-bold tracking-tight sm:text-center sm:text-5xl">
                {loading}
              </div>
            ) : (
              <>
                <div className="flex row-span-full justify-center">
                  <h1 className="font-bold tracking-tight text-center text-2xl sm:text-5xl">
                    {`Regen Bingo Card #${Number(id)}`}
                  </h1>
                </div>
                <div className="flex row-span-full mt-4">
                  <div className="bg-white rounded-2xl shadow-2xl my-4">
                    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 lg:py-12 ">
                      <div className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                        <div className="lg:col-span-2">
                          <div className="space-y-12 sm:-mt-8 sm:space-y-0 divide-y divide-gray-200 lg:gap-x-8 lg:space-y-0">
                            {card && <Card card={card} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  if (isNaN(Number(id))) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      id,
    },
  };
}

export default Cards;
