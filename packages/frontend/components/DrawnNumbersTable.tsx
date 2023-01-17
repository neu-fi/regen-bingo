import React from "react";

type DrawnNumbersTableProps = {
  drawnNumbers: number[];
};

export function DrawnNumbersTable(props: DrawnNumbersTableProps) {
  const { drawnNumbers } = props;

  return (
    <div className="py-10">
      <div className="p-6 overflow-auto rounded-lg bg-yellow-100 shadow block">
        <div className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9">
          {drawnNumbers.map((number, index) => (
            <div
              key={index}
              className="text-sm text-gray-900 font-light p-6 whitespace-nowrap"
            >
              <span className="bg-green-1 shadow w-14 h-14 pt-2 leading-10 text-center rounded-full inline-block text-xl font-black">
                {number}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DrawnNumbersTable;
