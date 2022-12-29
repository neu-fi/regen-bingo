import React from "react";

type Card = {
  card: ICard;
};

export interface ICard {
  id: number;
  numbers: number[];
  image: string;
  matches?: number[];
}

export function Card(props: Card) {
  return (
    <div>
      <div className="bg-white lg:mx-8 lg:flex lg:max-w-5xl lg:shadow-lg lg:rounded-lg">
        <div className="py-12 px-6 max-w-xl lg:max-w-5xl lg:w-1/2">
          <h2 className="text-3xl text-gray-800 font-bold">
            Build Your New <span className="text-indigo-600">Idea</span>
          </h2>
          <p className="mt-4 text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quidem
            modi reprehenderit vitae exercitationem aliquid dolores ullam
            temporibus enim expedita aperiam mollitia iure consectetur dicta
            tenetur, porro consequuntur saepe accusantium consequatur.
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
