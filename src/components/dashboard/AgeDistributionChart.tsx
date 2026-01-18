import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type AgeDistribution = {
  age: number;
  students: number;
};

type Props = {
  data: AgeDistribution[];
};

const COLORS = ["#4A628A", "#F2D25C", "#F05A7E", "#C3E3F9", "#6FC28D"];

export default function AgeDistributionChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            borderColor: "lightgray",
          }}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
        />
        <Pie
          data={data}
          dataKey="students"
          nameKey="age"
          cx="50%"
          cy="45%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
