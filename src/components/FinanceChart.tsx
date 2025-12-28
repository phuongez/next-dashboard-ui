"use client";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";

// #region Sample data
const data = [
  {
    name: "Thg 1",
    income: 4000,
    expense: 2400,
  },
  {
    name: "Thg 2",
    income: 3000,
    expense: 1398,
  },
  {
    name: "Thg 3",
    income: 2000,
    expense: 9800,
  },
  {
    name: "Thg 4",
    income: 2780,
    expense: 3908,
  },
  {
    name: "Thg 5",
    income: 1890,
    expense: 4800,
  },
  {
    name: "Thg 6",
    income: 2390,
    expense: 3800,
  },
  {
    name: "Thg 7",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Thg 8",
    income: 2000,
    expense: 9800,
  },
  {
    name: "Thg 9",
    income: 2780,
    expense: 3908,
  },
  {
    name: "Thg 10",
    income: 1890,
    expense: 4800,
  },
  {
    name: "Thg 11",
    income: 2390,
    expense: 3800,
  },
  {
    name: "Thg 12",
    income: 3490,
    expense: 4300,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-lg h-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <LineChart
        style={{
          width: "100%",
          //   maxWidth: "700px",
          height: "90%",
          //   maxHeight: "70vh",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: "#d1d5db" }}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          width="auto"
          axisLine={false}
          tick={{ fill: "#d1d5db" }}
          tickLine={false}
          tickMargin={20}
        />
        <Tooltip />
        <Legend
          align="center"
          verticalAlign="top"
          wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#CFCEFF"
          strokeWidth={5}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#C3EBFA"
          strokeWidth={5}
        />
        <RechartsDevtools />
      </LineChart>
    </div>
  );
};

export default FinanceChart;
