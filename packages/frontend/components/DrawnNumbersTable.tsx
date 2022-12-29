import React from "react";

type DrawnNumbersTableProps = {
  drawnNumbers: ITableElement[];
};

export interface ITableElement {
  drawnNumber: number;
  timestamp: string;
  seed: string;
  txhash: string;
}

export function DrawnNumbersTable(props: DrawnNumbersTableProps) {
  const { drawnNumbers } = props;
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="table-auto min-w-full">
              <thead className="border-b">
                <tr>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                  >
                    Drawn Number
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                  >
                    Seed
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                  >
                    Tx Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {drawnNumbers.map((drawnNumber) => (
                  <tr className=" border-b transition duration-300 ease-in-out hover:bg-indigo-100">
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {drawnNumber.drawnNumber}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {drawnNumber.timestamp}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {drawnNumber.seed}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {drawnNumber.txhash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawnNumbersTable;
