import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

type AttendanceRate = {
  name: string; // "Có mặt" | "Vắng"
  value: number;
};

type Props = {
  data: AttendanceRate[];
};

export default function AttendanceRateChart({ data }: Props) {
  return (
    <div className="h-80 w-full">
      <h3 className="font-semibold mb-2">Tỷ lệ chuyên cần</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
