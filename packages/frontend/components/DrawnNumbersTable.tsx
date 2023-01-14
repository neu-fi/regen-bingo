import React from "react";

type DrawnNumbersTableProps = {
  drawnNumbers: number[];
};

export function DrawnNumbersTable(props: DrawnNumbersTableProps) {
  const { drawnNumbers } = props;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-4 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-auto rounded-lg bg-yellow-100 shadow block ">
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10">
              {drawnNumbers.map((number) => (
                <div className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-1 hover:bg-yellow-2 w-10 leading-10 mx-1 text-center rounded-full inline-block cursor-pointer">
                    {number}
                  </span>
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
