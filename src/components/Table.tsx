// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { ChevronUp, ChevronDown } from "lucide-react";
// import React from "react";

// type Column = {
//   header: string;
//   accessor: string;
//   className?: string;
//   sortKey?: string;
// };

// type TableProps<T> = {
//   columns: Column[];
//   children?: React.ReactNode;
//   // renderRow: (item: T) => React.ReactNode;
// };

// const Table = <T,>({ columns, children }: TableProps<T>) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const currentSortBy = searchParams.get("sortBy");
//   const currentSortOrder = searchParams.get("sortOrder");

//   const handleSort = (sortKey: string) => {
//     const params = new URLSearchParams(searchParams.toString());

//     const isSameColumn = currentSortBy === sortKey;
//     const nextOrder =
//       isSameColumn && currentSortOrder === "asc" ? "desc" : "asc";

//     params.set("sortBy", sortKey);
//     params.set("sortOrder", nextOrder);
//     params.set("page", "1"); // reset page khi sort

//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const renderSortIcon = (sortKey?: string) => {
//     if (!sortKey) return null;

//     if (currentSortBy !== sortKey) {
//       return (
//         <span className="opacity-30">
//           <ChevronUp size={14} />
//         </span>
//       );
//     }

//     return currentSortOrder === "asc" ? (
//       <ChevronUp size={14} className="text-black" />
//     ) : (
//       <ChevronDown size={14} className="text-black" />
//     );
//   };

//   return (
//     <table className="w-full border-collapse">
//       <thead>
//         <tr className="text-left text-sm text-gray-500">
//           {columns.map((col) => (
//             <th
//               key={col.accessor}
//               className={`p-4 ${
//                 col.sortKey ? "cursor-pointer select-none" : ""
//               } ${col.className || ""}`}
//               onClick={() => col.sortKey && handleSort(col.sortKey)}
//             >
//               <div className="flex items-center gap-1">
//                 {col.header}
//                 {renderSortIcon(col.sortKey)}
//               </div>
//             </th>
//           ))}
//         </tr>
//       </thead>

//       <tbody>
//         {/* {data.map((item, index) => (
//           <React.Fragment key={index}>{renderRow(item)}</React.Fragment>
//         ))} */}
//         {children}
//       </tbody>
//     </table>
//   );
// };

// export default Table;

const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col) => (
            <th key={col.accessor} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item) => renderRow(item))}</tbody>
    </table>
  );
};

export default Table;
