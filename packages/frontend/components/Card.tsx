import { classNames } from "@/utils/utils";
import React from "react";
import { ITableElement } from "./DrawnNumbersTable";

type Card = {
  card: ICard;
  drawnNumbers: number[];
};

export interface ICard {
  id: number;
  numbers: number[];
  image: string;
  matches?: number[];
}

export function Card(props: Card) {
  const { card, drawnNumbers } = props;
  return (
    <div>
      <div className="bg-white lg:flex lg:max-w-5xl lg:shadow-lg lg:rounded-lg min-w-full">
        <div className="py-12 px-6 min-w-[50%] w-1/2 max-w-xl lg:max-w-5xl lg:w-1/2">
          <h2 className="text-3xl text-gray-800 font-bold">
            Build Your New <span className="text-indigo-600">Idea</span>
          </h2>
          <p className="mt-4 text-gray-600 prose prose-indigo max-w-none">
            <ul role="list">
              <li>
                <span className="text-indigo-700">Card Id: </span> {card.id}{" "}
              </li>
              <li>
                <div className="flex flex-col">
                  <span className="text-indigo-700">Numbers on card: </span>{" "}
                  <div className="flex flex-row flex-wrap">
                    {card.numbers.map((number) => {
                      return (
                        <span
                          className={classNames(
                            drawnNumbers.includes(number)
                              ? "bg-violet-200 text-indigo-700 hover:text-indigo-900 hover:bg-violet-100"
                              : "text-gray-700 hover:text-gray-900 hover:bg-violet-100",
                            "px-4 py-2 mx-1 text-center rounded-full"
                          )}
                        >
                          {number}
                        </span>
                      );
                    })}{" "}
                  </div>
                </div>
              </li>
            </ul>
          </p>

          <div className="mt-8">
            <a
              href="#"
              className="bg-gray-900 text-gray-100 px-5 py-3 font-semibold rounded"
            >
              Start Now
            </a>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div
            className="h-64 bg-cover lg:rounded-lg lg:h-full"
            style={{
              backgroundImage: `url(
                            "${props.card.image}}"
                          )`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Card;
