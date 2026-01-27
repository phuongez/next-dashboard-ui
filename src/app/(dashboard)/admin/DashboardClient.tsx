"use client";

import StudentsByGradeChart from "@/components/dashboard/StudentsByGradeChart";
import AgeDistributionChart from "@/components/dashboard/AgeDistributionChart";
import ClassesPerTeacherChart from "@/components/dashboard/ClassesPerTeacherChart";
import ScoreDistributionChart from "@/components/dashboard/ScoreDistributionChart";
import AttendanceRateChart from "@/components/dashboard/AttendanceRateChart";
import DashboardCard from "./DashboardCard";

type DashboardData = {
  studentsByGrade: { grade: number; students: number }[];
  ageDistribution: { age: number; students: number }[];
  classesPerTeacher: { teacher: string; classes: number }[];
  scoreDistribution: { range: string; students: number }[];
  attendanceRate: { name: string; value: number }[];
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <DashboardCard title="Học sinh theo khối">
        <StudentsByGradeChart data={data.studentsByGrade} />
      </DashboardCard>
      <DashboardCard title="Phân bố điểm">
        <ScoreDistributionChart data={data.scoreDistribution} />
      </DashboardCard>

      {/* <DashboardCard title="Độ tuổi học sinh">
        <AgeDistributionChart data={data.ageDistribution} />
      </DashboardCard> */}
      {/* <div className="md:col-span-2">
        <DashboardCard title="Số tiết học / giáo viên">
          <ClassesPerTeacherChart data={data.classesPerTeacher} />
        </DashboardCard>
      </div> */}

      {/* <DashboardCard title="Chuyên cần">
        <AttendanceRateChart data={data.attendanceRate} />
      </DashboardCard> */}
    </div>
  );
}
