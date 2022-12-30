import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "What is this?",
    answer: `
    "Bingo is a game of probability in which players mark off numbers on cards as the numbers are drawn randomly by a caller, the winner being the first person to mark off all their numbers"
    -Wikipedia

    While there are a couple of versions of the game, this version is based-on the widely known British version where the win condition is simply being the first to match all numbers on the card with the randomly drawn numbers.
    
    RegenBingo is a simple experimental game to raise ETH for public goods funding while entertaining us greenpilled regens. We're always looking for creative ways to help contribute to public good causes.
    `,
  },
  {
    question: "How are the winning numbers determined?",
    answer: `The drawn numbers are psuedo-randomly generated in the smart contract when the drawNumber() function is called. This function is a public function that require no priviledges, callable by any address as long as the cooldown seconds condition between executions is satisfied.
    `,
  },
  {
    question: "How is the winner determined?",
    answer: `Each Bingo card NFT has 15 randomly generated numbers on it. At [time] UTC, winning numbers will begin to be drawn by randomly generating them in the smart contract. The first Bingo card to have all winning numbers earns the prize pool in the contract. Any address can claim the prize for a winning card. However, the prize is only transferred to the address actually holding the winning card.
    `,
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function FAQ() {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl divide-y-2 divide-gray-200">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt className="text-lg">
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-400">
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon
                            className={classNames(
                              open ? "-rotate-180" : "rotate-0",
                              "h-6 w-6 transform"
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base text-gray-500 whitespace-pre-line max-w-content">
                        {faq.answer}
                      </p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
