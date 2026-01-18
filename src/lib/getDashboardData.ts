import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const currentYear = new Date().getFullYear();

  const [grades, students, teachers, results, presentCount, absentCount] =
    await Promise.all([
      // 1️⃣ Students by Grade
      prisma.grade.findMany({
        select: {
          level: true,
          _count: { select: { students: true } },
        },
        orderBy: { level: "asc" },
      }),

      // 2️⃣ Age Distribution
      prisma.student.findMany({
        select: { birthday: true },
      }),

      // 3️⃣ Classes per Teacher
      prisma.teacher.findMany({
        select: {
          name: true,
          surname: true,
          _count: { select: { lessons: true } },
        },
      }),

      // 4️⃣ Score Distribution
      prisma.result.findMany({
        select: { score: true },
      }),

      // 5️⃣ Attendance
      prisma.attendance.count({ where: { present: true } }),
      prisma.attendance.count({ where: { present: false } }),
    ]);

  /* -----------------------------
     TRANSFORM DATA
  ----------------------------- */

  // Students by Grade
  const studentsByGrade = grades.map((g) => ({
    grade: g.level,
    students: g._count.students,
  }));

  // Age Distribution
  const ageMap: Record<number, number> = {};
  students.forEach((s) => {
    const age = currentYear - s.birthday.getFullYear();
    ageMap[age] = (ageMap[age] || 0) + 1;
  });

  const ageDistribution = Object.entries(ageMap)
    .map(([age, students]) => ({
      age: Number(age),
      students,
    }))
    .sort((a, b) => a.age - b.age);

  // Classes per Teacher
  const classesPerTeacher = teachers
    .map((t) => ({
      teacher: `${t.surname} ${t.name}`,
      classes: t._count.lessons,
    }))
    .sort((a, b) => b.classes - a.classes);

  // Score Distribution
  const scoreDistributionMap = {
    "0-4": 0,
    "5-6": 0,
    "7-8": 0,
    "9-10": 0,
  };

  results.forEach((r) => {
    if (r.score <= 4) scoreDistributionMap["0-4"]++;
    else if (r.score <= 6) scoreDistributionMap["5-6"]++;
    else if (r.score <= 8) scoreDistributionMap["7-8"]++;
    else scoreDistributionMap["9-10"]++;
  });

  const scoreDistribution = Object.entries(scoreDistributionMap).map(
    ([range, students]) => ({ range, students })
  );

  // Attendance Rate
  const totalAttendance = presentCount + absentCount;

  const attendanceRate = [
    {
      name: "Có mặt",
      value: totalAttendance
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0,
    },
    {
      name: "Vắng",
      value: totalAttendance
        ? Math.round((absentCount / totalAttendance) * 100)
        : 0,
    },
  ];

  return {
    studentsByGrade,
    ageDistribution,
    classesPerTeacher,
    scoreDistribution,
    attendanceRate,
  };
}
