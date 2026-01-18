//app/(dashboard)/list/academic/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { calculateAcademic } from "@/lib/academic";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@/generated/prisma/client";

const AcademicPage = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const params = await searchParams;
  const search = params?.search;

  if (!userId || (role !== "admin" && role !== "teacher")) {
    return null;
  }

  /* ======================================================
     1. LẤY DANH SÁCH HỌC SINH (ĐÚNG SCHEMA)
     student → class → lesson → teacher
  ====================================================== */

  let studentWhere: any = {};

  const roleCondition =
    role === "teacher"
      ? {
          class: {
            lessons: {
              some: {
                teacherId: userId,
              },
            },
          },
        }
      : {};

  const searchCondition = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            surname: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }
    : {};

  studentWhere = {
    AND: [roleCondition, searchCondition],
  };

  const students = await prisma.student.findMany({
    where: studentWhere,
    select: {
      id: true,
      name: true,
      surname: true,
      class: true,
    },
    orderBy: { name: "asc" },
  });

  if (students.length === 0) {
    return <div className="bg-white p-6 m-4 rounded-md">Không có học sinh</div>;
  }

  /* ======================================================
     2. LẤY TOÀN BỘ RESULT LIÊN QUAN
     exam/assignment → lesson → subject
  ====================================================== */

  const results = await prisma.result.findMany({
    where: {
      studentId: { in: students.map((s) => s.id) },
      ...(role === "teacher" && {
        OR: [
          { exam: { lesson: { teacherId: userId } } },
          { assignment: { lesson: { teacherId: userId } } },
        ],
      }),
    },
    include: {
      exam: {
        include: {
          lesson: {
            include: {
              subject: true,
            },
          },
        },
      },
      assignment: {
        include: {
          lesson: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
  });

  /* ======================================================
     3. BUILD MAP: student → subject (LOGIC)
     ❗ KEY = subject được suy ra từ lesson
  ====================================================== */

  type SubjectBucket = {
    subjectKey: string;
    subjectName: string;
    examScores: number[];
    assignmentScores: number[];
  };

  const studentMap: Record<
    string,
    {
      studentName: string;
      studentClass: string;
      subjects: Record<string, SubjectBucket>;
    }
  > = {};

  // init student
  students.forEach((s) => {
    studentMap[s.id] = {
      studentName: `${s.surname} ${s.name}`,
      studentClass: s.class.name,
      subjects: {},
    };
  });

  // fill scores
  results.forEach((r) => {
    const assessment = r.exam ?? r.assignment;
    if (!assessment) return;

    const lesson = assessment.lesson;
    if (!lesson || !lesson.subject) return;

    const subject = lesson.subject;

    /**
     * 🔑 SUBJECT LOGIC KEY
     * Ưu tiên code, fallback name
     * KHÔNG dùng subject.id trực tiếp
     */
    const subjectKey = subject.name;

    const student = studentMap[r.studentId];
    if (!student) return;

    if (!student.subjects[subjectKey]) {
      student.subjects[subjectKey] = {
        subjectKey,
        subjectName: subject.name,
        examScores: [],
        assignmentScores: [],
      };
    }

    if (r.exam) {
      student.subjects[subjectKey].examScores.push(r.score);
    }

    if (r.assignment) {
      student.subjects[subjectKey].assignmentScores.push(r.score);
    }
  });

  /* ======================================================
     4. TÍNH HỌC LỰC CHO TỪNG HỌC SINH
     (DÙNG CHUNG HELPER)
  ====================================================== */

  const academicList = Object.entries(studentMap).map(([studentId, data]) => {
    const subjectInputs = Object.values(data.subjects).map((s) => ({
      subjectId: s.subjectKey,
      subjectName: s.subjectName,
      examScores: s.examScores,
      assignmentScores: s.assignmentScores,
    }));

    const academic = calculateAcademic(subjectInputs, {
      minSubjectsToEvaluate: 1,
    });

    return {
      studentId,
      studentClass: data.studentClass,
      studentName: data.studentName,
      ...academic,
    };
  });

  /* ======================================================
     5. UI
  ====================================================== */

  return (
    <div className="bg-white p-6 m-4 rounded-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Học lực học sinh</h1>
        <TableSearch />
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">Học sinh</th>
            <th className="p-3 text-left">Lớp</th>
            <th className="p-3 text-center">Số môn</th>
            <th className="p-3 text-center">Điểm TB</th>
            <th className="p-3 text-center">Xếp loại</th>
            <th className="p-3 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {academicList.map((s) => (
            <tr key={s.studentId} className="border-b">
              <td className="p-3">{s.studentName}</td>
              <td className="p-3">{s.studentClass}</td>
              <td className="p-3 text-center">{s.subjectCount}</td>
              <td className="p-3 text-center font-semibold">
                {s.academicAvg ?? "—"}
              </td>
              <td className="p-3 text-center">{s.level}</td>
              <td className="p-3 text-center">
                <Link
                  href={`/list/results?studentId=${s.studentId}`}
                  className="text-blue-600 hover:underline"
                >
                  Xem
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicPage;
