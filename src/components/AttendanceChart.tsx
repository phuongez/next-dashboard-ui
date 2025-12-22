"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import Image from "next/image";

// #region Sample data
const data = [
  {
    name: "Thứ 2",
    present: 60,
    absent: 40,
  },
  {
    name: "Thứ 3",
    present: 70,
    absent: 60,
  },
  {
    name: "Thứ 4",
    present: 90,
    absent: 75,
  },
  {
    name: "Thứ 5",
    present: 65,
    absent: 55,
  },
  {
    name: "Thứ 6",
    present: 80,
    absent: 70,
  },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-lg h-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Attendance chart</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="w-[100%].h-[90%]">
        <BarChart
          style={{
            width: "90%",
            height: "80%",
          }}
          responsive
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
          barSize={20}
          width={500}
          height={300}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis
            width="auto"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar
            dataKey="absent"
            fill="#FAE27C"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="present"
            fill="#C3EBFA"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <RechartsDevtools />
        </BarChart>
      </div>
    </div>
  );
};

export default AttendanceChart;
