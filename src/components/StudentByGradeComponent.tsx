import CountChartContainer from "./CountChartContainer";
import AttendanceChartContainer from "./AttendanceChartContainer";
import { getDashboardData } from "@/lib/getDashboardData";
import StudentsByGradeChart from "./dashboard/StudentsByGradeChart";

async function StudentByGradeComponent() {
  const data = await getDashboardData();
  return (
    <div className="flex gap-4 flex-col lg:flex-row">
      <div className="w-full lg:w-1/3 h-[450px]">
        <StudentsByGradeChart data={data.studentsByGrade} />
      </div>
      {/* ATTENDANCE CHART */}
      <div className="w-full lg:w-2/3 h-[450px]">
        <AttendanceChartContainer />
      </div>
    </div>
  );
}

export default StudentByGradeComponent;
