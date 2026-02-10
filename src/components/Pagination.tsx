"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

type PaginationProps = {
  page: number;
  count: number;
};

const Pagination = ({ page, count }: PaginationProps) => {
  const router = useRouter();

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  /* =========================
     DESKTOP PAGE LOGIC
  ========================= */
  const getPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      {/* PREV */}
      <button
        disabled={!hasPrev}
        onClick={() => changePage(page - 1)}
        className="py-2 px-3 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹
      </button>

      {/* =========================
          MOBILE VIEW
      ========================= */}
      <div className="flex items-center gap-2 text-sm md:hidden">
        <span className="font-semibold text-gray-700">
          {page} / {totalPages}
        </span>
      </div>

      {/* =========================
          DESKTOP VIEW
      ========================= */}
      <div className="hidden md:flex items-center gap-2 text-sm">
        {getPages().map((p, index) =>
          p === "..." ? (
            <span key={`dots-${index}`} className="px-2">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => changePage(p)}
              aria-current={page === p ? "page" : undefined}
              className={`px-2 rounded-sm ${
                page === p
                  ? "bg-lamaYellow text-white font-semibold"
                  : "hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* NEXT */}
      <button
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
        className="py-2 px-3 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;

// "use client";

// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { useRouter } from "next/navigation";

// const Pagination = ({ page, count }: { page: number; count: number }) => {
//   const router = useRouter();

//   const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
//   const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

//   const changePage = (newPage: number) => {
//     const params = new URLSearchParams(window.location.search);
//     params.set("page", newPage.toString());
//     router.push(`${window.location.pathname}?${params}`);
//   };
//   return (
//     <div className="p-4 flex items-center justify-between text-gray-500">
//       <button
//         disabled={!hasPrev}
//         className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//         onClick={() => {
//           changePage(page - 1);
//         }}
//       >
//         Trước
//       </button>
//       <div className="flex items-center gap-2 text-sm">
//         {Array.from(
//           { length: Math.ceil(count / ITEM_PER_PAGE) },
//           (_, index) => {
//             const pageIndex = index + 1;
//             return (
//               <button
//                 key={pageIndex}
//                 className={`px-2 rounded-sm ${
//                   page === pageIndex ? "bg-lamaYellow text-white" : ""
//                 }`}
//                 onClick={() => {
//                   changePage(pageIndex);
//                 }}
//               >
//                 {pageIndex}
//               </button>
//             );
//           }
//         )}
//       </div>
//       <button
//         className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//         disabled={!hasNext}
//         onClick={() => {
//           changePage(page + 1);
//         }}
//       >
//         Tiếp
//       </button>
//     </div>
//   );
// };

// export default Pagination;
