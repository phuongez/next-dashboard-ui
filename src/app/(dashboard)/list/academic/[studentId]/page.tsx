//app/(dashboard)/list/academic/[studentId]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { calculateAcademic } from "@/lib/academic";

type PageProps = {
  params: {
    studentId: string;
  };
};

const AcademicStudentDetailPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { studentId } = resolvedParams;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) return null;

  /* =========================
     1. KIỂM TRA QUYỀN TRUY CẬP
  ========================== */

  if (!role) redirect("/");

  switch (role) {
    case "admin":
      // toàn quyền
      break;

    case "student":
      if (userId !== studentId) redirect("/");
      break;

    case "parent": {
      const child = await prisma.student.findFirst({
        where: {
          id: studentId,
          parentId: userId,
        },
        select: { id: true },
      });
      if (!child) redirect("/");
      break;
    }

    case "teacher": {
      const canAccess = await prisma.student.findFirst({
        where: {
          id: studentId,
          class: {
            lessons: {
              some: {
                teacherId: userId,
              },
            },
          },
        },
        select: { id: true },
      });
      if (!canAccess) redirect("/");
      break;
    }

    default:
      redirect("/");
  }

  /* =========================
     2. LẤY THÔNG TIN HỌC SINH
  ========================== */

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      name: true,
      surname: true,
      class: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!student) notFound();

  /* =========================
     3. LẤY KẾT QUẢ HỌC TẬP
  ========================== */

  const results = await prisma.result.findMany({
    where: {
      studentId,
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

  /* =========================
     4. BUILD SUBJECT INPUT
  ========================== */

  const subjectMap: Record<
    string,
    {
      subjectId: string;
      subjectName: string;
      examScores: number[];
      assignmentScores: number[];
    }
  > = {};

  results.forEach((r) => {
    const assessment = r.exam || r.assignment;
    if (!assessment) return;

    const subject = assessment.lesson.subject;
    if (!subject) return;

    // if (!subjectMap[subject.id]) {
    //   subjectMap[subject.id] = {
    //     subjectId: String(subject.id),
    //     subjectName: subject.name,
    //     examScores: [],
    //     assignmentScores: [],
    //   };
    // }

    const subjectKey = subject.name;

    if (!subjectMap[subjectKey]) {
      subjectMap[subjectKey] = {
        subjectId: subjectKey,
        subjectName: subject.name,
        examScores: [],
        assignmentScores: [],
      };
    }

    if (r.exam) subjectMap[subject.id].examScores.push(r.score);
    if (r.assignment) subjectMap[subject.id].assignmentScores.push(r.score);
  });

  const academic = calculateAcademic(Object.values(subjectMap), {
    minSubjectsToEvaluate: 3,
  });

  /* =========================
     5. UI
  ========================== */

  return (
    <div className="bg-white p-6 m-4 rounded-md">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Học lực</h1>
        <p className="text-gray-600">
          {student.name} {student.surname} – Lớp {student.class.name}
        </p>
      </div>

      {/* SUMMARY */}
      <div className="mb-8">
        {academic.status === "NO_DATA" && (
          <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600">
            Chưa có điểm
          </span>
        )}

        {academic.status === "IN_PROGRESS" && (
          <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700">
            Đang cập nhật
          </span>
        )}

        {academic.status === "EVALUATED" && (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">{academic.academicAvg}</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold
                ${
                  academic.level === "Giỏi"
                    ? "bg-green-100 text-green-700"
                    : academic.level === "Khá"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {academic.level}
            </span>
          </div>
        )}
      </div>

      {/* SUBJECT TABLE */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">Môn học</th>
            <th className="p-3 text-center">Điểm TB môn</th>
          </tr>
        </thead>
        <tbody>
          {academic.subjects.map((s) => (
            <tr key={s.subjectId} className="border-b">
              <td className="p-3">{s.subjectName}</td>
              <td className="p-3 text-center">{s.subjectAvg ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicStudentDetailPage;
