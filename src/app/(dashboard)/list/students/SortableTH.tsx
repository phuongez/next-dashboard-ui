"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortableTH({
  label,
  sortKey,
  style,
}: {
  label: string;
  sortKey: string;
  style?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const currentSortBy = params.get("sortBy");
  const currentOrder = params.get("sortOrder");

  const isActive = currentSortBy === sortKey;

  let nextSortBy: string | null = sortKey;
  let nextOrder: string | null = "asc";

  if (!isActive) {
    nextOrder = "asc";
  } else if (currentOrder === "asc") {
    nextOrder = "desc";
  } else {
    // desc → bỏ sort
    nextSortBy = null;
    nextOrder = null;
  }

  if (nextSortBy) {
    params.set("sortBy", nextSortBy);
    params.set("sortOrder", nextOrder!);
  } else {
    params.delete("sortBy");
    params.delete("sortOrder");
  }

  params.set("page", "1");

  return (
    <th className={`text-left text-sm text-gray-500 ${style}`}>
      <button
        onClick={() => router.push(`?${params.toString()}`)}
        className="flex items-center gap-1 hover:text-black"
      >
        {label}
        <span className="text-xs">
          {!isActive && "↕"}
          {isActive && currentOrder === "asc" && "↑"}
          {isActive && currentOrder === "desc" && "↓"}
        </span>
      </button>
    </th>
  );
}
