import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

type ClassesPerTeacher = {
  teacher: string;
  classes: number;
};

type Props = {
  data: ClassesPerTeacher[];
};

// const COLORS = ["#C3E3F9", "#F2D25C", "#F05A7E", "#4A628A", "#6FC28D"];
const COLORS = ["#4A628A", "#F2D25C", "#F05A7E", "#C3E3F9"];

export default function ClassesPerTeacherChart({ data }: Props) {
  return (
    <div className="h-120 w-full">
      <ResponsiveContainer width="100%" height={600}>
        <BarChart data={data} layout="vertical" barSize={10}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#ddd"
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#d1d5db" }}
          />
          <YAxis
            type="category"
            dataKey="teacher"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#d1d5db" }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              borderColor: "lightgray",
            }}
          />
          <Bar dataKey="classes" radius={[0, 10, 10, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
