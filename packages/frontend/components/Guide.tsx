export default function Guide() {
  return (
    <div className="relative overflow-hidden pt-24 px-12 bg-green-5 pb-24">
      <div className="justify-center grid grid-rows-2 grid-flow-col gap-32 ">
        <div className="hidden sm:block row-span-3 max-w-lg">
          <img className="h-max w-max" src="/example-board@3x.png" />
        </div>

        <div className="row-span-2 max-w-lg">
          <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-2xl">
            What the heck is RegenBingo?
          </span>
          <p className="mt-8 text-md leading-8 text-gray-500">
            All card sale proceeds make up the prize and the public goods
            funding pool. The total pool is divided into half and sent to
            winning address and pre-determined charity address,{" "}
            <a className="no-underline" href="https://gitcoin.co/grants/">
              Gitcoin Matching Fund
            </a>{" "}
            when the winner claims their prize from the smart contract.
            <ul>
              <li>50% - Prize pool</li>
              <li>50% - Gitcoin Matching Fund</li>
            </ul>
          </p>
        </div>
      </div>
      <div className="justify-center grid grid-rows-2 grid-flow-col gap-32">
        <div className="row-span-2 max-w-lg">
          <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-2xl">
            What the heck is RegenBingo?
          </span>
          <p className="mt-8 text-md leading-8 text-gray-500">
            All card sale proceeds make up the prize and the public goods
            funding pool. The total pool is divided into half and sent to
            winning address and pre-determined charity address,{" "}
            <a className="no-underline" href="https://gitcoin.co/grants/">
              Gitcoin Matching Fund
            </a>{" "}
            when the winner claims their prize from the smart contract.
            <ul>
              <li>50% - Prize pool</li>
              <li>50% - Gitcoin Matching Fund</li>
            </ul>
          </p>
        </div>
        <div className="hidden sm:block row-span-3">
          <img
            loading="lazy"
            className="object-scale-down h-96 w-96"
            src="/3-coin@3x.png"
          />
        </div>
      </div>
    </div>
  );
}
