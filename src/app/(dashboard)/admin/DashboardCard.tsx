"use client";

import Image from "next/image";

export default function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {children}
    </div>
  );
}
