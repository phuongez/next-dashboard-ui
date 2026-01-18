// app/dashboard/page.tsx

import { getDashboardData } from "@/lib/getDashboardData";
import DashboardClient from "./DashboardClient";

import Annoucement from "@/components/Annoucement";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) {
  const data = await getDashboardData();

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" title="Quản lí" />
          <UserCard type="teacher" title="Giáo viên" />
          <UserCard type="student" title="Học sinh" />
          <UserCard type="parent" title="Phụ huynh" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        <DashboardClient data={data} />
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Annoucement />
      </div>
    </div>
  );
}
