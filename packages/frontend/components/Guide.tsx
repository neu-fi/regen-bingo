export default function Guide() {
  return (
    <div className="relative overflow-hidden pt-24 px-12 bg-green-5 pb-24">
      <div className="flex justify-center grid grid-rows-2 grid-flow-col gap-32 ">
        <div className="row-span-3 max-w-lg">
          <img className="h-max w-max" src="/example-board@3x.png"/> 
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

          {/* <blockquote>
            <p>
              Sagittis scelerisque nulla cursus in enim consectetur quam. Dictum
              urna sed consectetur neque tristique pellentesque. Blandit amet,
              sed aenean erat arcu morbi.
            </p>
          </blockquote>
          <p>
            Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus
            enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor
            praesent donec est. Odio penatibus risus viverra tellus varius sit
            neque erat velit.
          </p>
          <figure>
            <img
              className="w-full rounded-lg"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1310&h=873&q=80&facepad=3"
              alt=""
              width={1310}
              height={873}
            />
            <figcaption>
              Sagittis scelerisque nulla cursus in enim consectetur quam.
            </figcaption>
          </figure> */}

      </div>
      <div className="flex justify-center grid grid-rows-2 grid-flow-col gap-32">

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
        <div className="row-span-3">
          <img className="object-scale-down h-96 w-96" src="/3-coin@3x.png"/> 
        </div>
        </div>

    </div>
  );
}
