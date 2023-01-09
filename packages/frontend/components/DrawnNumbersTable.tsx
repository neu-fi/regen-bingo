import { clipHash } from "@/utils/utils";
import { getTimeDifference } from "@/utils/utils";
import React from "react";

type DrawnNumbersTableProps = {
  drawnNumbers: ITableElement[];
};

export interface ITableElement {
  drawnNumber: number;
  timestamp: string;
  seed?: string;
  txHash?: string;
  id?: number;
}

export function DrawnNumbersTable(props: DrawnNumbersTableProps) {
  const { drawnNumbers } = props;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-auto rounded-lg shadow hidden sm:block ">
            <table className="table-auto w-full">
              <thead className="border-b bg-yellow-2">
                <tr>
                  <th
                    scope="col"
                    className="text-sm w-20 font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Drawn Number
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="text-sm w-40 font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 ">
                {drawnNumbers.map((drawnNumber) => (
                  <tr
                    key={drawnNumber.drawnNumber}
                    className=" border-b transition duration-300 ease-in-out hover:bg-indigo-100"
                  >
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      <span className="bg-green-1 hover:bg-yellow-2 w-10 leading-10 mx-1 text-center rounded-full inline-block">
                        {drawnNumber.drawnNumber}
                      </span>
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {getTimeDifference(drawnNumber.timestamp)}
                    </td>

                    <td
                      style={{ wordBreak: "break-word" }}
                      className="text-sm text-center text-gray-900 font-light px-6 py-4 "
                    >
                      <a
                        href={`https://etherscan.io/tx/${drawnNumber.txHash}`}
                        target="_blank"
                        className="font-bold no-underline text-dark-1 hover:underline"
                      >
                        {drawnNumber.txHash ? (
                          <>{clipHash(drawnNumber.txHash)}</>
                        ) : (
                          <></>
                        )}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
          </div>
          <div className="flex gap-4 sm:hidden">
            <div className="flex justify-center space-y-3 py-4 overflow-auto">
              {drawnNumbers.map((drawnNumber) => (
                <div className="flex flex-col items-center space-x-2 space-y-4 px-2 py-4 mb-2 mx-2 text-sm rounded-lg shadow-md overflow-auto">
                  <div className="flex ">
                    <div className="col-auto">
                      <a
                        href={
                          drawnNumber.txHash
                            ? `https://etherscan.io/tx/${drawnNumber.txHash}`
                            : "#"
                        }
                        target="_blank"
                        className="bg-green-1 hover:bg-yellow-2 w-10 leading-10 mx-1 text-center rounded-full inline-block"
                      >
                        {drawnNumber.drawnNumber}
                      </a>
                    </div>
                  </div>

                  <div className="col-auto">
                    Time: {getTimeDifference(drawnNumber.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawnNumbersTable;
