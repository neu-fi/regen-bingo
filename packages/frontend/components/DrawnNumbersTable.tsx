import React from "react";
import { useEffect } from "react";

// TODO: import contract from the contract package
const contract: any = {};

type DrawnNumbersTableProps = {
  onDrawnNumbersUpdate: (drawnNumbers: ITableElement[]) => void;
};

export interface ITableElement {
  drawnNumber: number;
  timestamp: string;
  seed: string;
  txHash: string;
}

export function DrawnNumbersTable(props: DrawnNumbersTableProps) {
  const { onDrawnNumbersUpdate } = props;
  // use useEffect to fetch drawnNumbers from the contract on each contract update
  const [drawnNumbers, setDrawnNumbers] = React.useState<ITableElement[]>([
    // TODO: Remove Dummy Data
    {
      drawnNumber: 1,
      timestamp: "2021-05-01T12:00:00Z",
      seed: "seedseedseedseedseedseedseedseed",
      txHash: "0x1234567890",
    },
    {
      drawnNumber: 2,
      timestamp: "2021-05-01T12:00:00Z",
      seed: "seed",
      txHash: "0x1234567890",
    },
    {
      drawnNumber: 21,
      timestamp: "2021-05-01T12:00:00Z",
      seed: "seed",
      txHash: "0x1234567890",
    },
  ]);
  useEffect(() => {
    const fetchDrawnNumbers = async () => {
      // TODO: Fetch drawnNumbers from the contract
      // const drawnNumbers = await contract.getDrawnNumbers();
      setDrawnNumbers(drawnNumbers);
      onDrawnNumbersUpdate(drawnNumbers);
    };
    fetchDrawnNumbers();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-auto rounded-lg shadow hidden sm:block ">
            <table className="table-auto min-w-full ">
              <thead className="border-b bg-indigo-50">
                <tr>
                  <th
                    scope="col"
                    className="text-sm w-4 font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Drawn Number
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="text-sm w-8 font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Seed
                  </th>
                  <th
                    scope="col"
                    className="text-sm w-8 font-medium text-gray-900 px-6 py-4 text-center"
                  >
                    Tx Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 ">
                {drawnNumbers.map((drawnNumber) => (
                  <tr className=" border-b transition duration-300 ease-in-out hover:bg-indigo-100">
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      <span className="bg-violet-200 text-indigo-700 hover:text-indigo-900 hover:bg-violet-100 px-4 py-3 mx-1 text-center rounded-full">
                        {drawnNumber.drawnNumber}
                      </span>
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(new Date(drawnNumber.timestamp))}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {drawnNumber.seed}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://etherscan.io/tx/${drawnNumber.txHash}`}
                        target="_blank"
                        className="font-bold no-underline text-blue-500 hover:underline"
                      >
                        {drawnNumber.txHash}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            <div className="space-y-3 py-4 overflow-auto">
              {drawnNumbers.map((drawnNumber) => (
                <div className="flex flex-col items-center space-x-2 space-y-4 px-2 py-4 mb-2 mx-2 text-sm rounded-lg shadow-md overflow-auto">
                  <div className="flex flex-row row-auto">
                    <div className="col-auto">
                      <span className="bg-violet-200 text-indigo-700 hover:text-indigo-900 hover:bg-violet-100 px-4 py-3 mx-1 text-center rounded-full">
                        {drawnNumber.drawnNumber}
                      </span>
                    </div>
                    <div className="col-auto text-sm font-medium">
                      <a
                        href={`https://etherscan.io/tx/${drawnNumber.txHash}`}
                        target="_blank"
                        className="font-bold no-underline text-blue-500 hover:underline"
                      >
                        {drawnNumber.txHash}
                      </a>
                    </div>
                  </div>
                  <div className="row-auto">
                    <div className="text-sm max-w-xs flex flex-row items-center">
                      <div className="flex col-1 space-x-1">
                        <span className="bg-violet-500 text-violet-100 px-1 py-0.5 text-center rounded-full">
                          Seed:
                        </span>
                      </div>
                      <div className="flex ml-2 col-8">{drawnNumber.seed}</div>
                    </div>
                  </div>
                  <div className="col-auto">
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(new Date(drawnNumber.timestamp))}
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
