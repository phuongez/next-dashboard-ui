import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import SortableTH from "../students/SortableTH";
import { calculateAcademic } from "@/lib/academic";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@/generated/prisma/client";

const AcademicPage = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || (role !== "admin" && role !== "teacher")) {
    return null;
  }

  const { page, sortBy, sortOrder, search } = (await searchParams) || {};
  const p = page ? parseInt(page) : 1;

  /* ======================================================
     1. BUILD STUDENT WHERE
  ====================================================== */
  const andConditions: Prisma.StudentWhereInput[] = [];

  if (role === "teacher") {
    andConditions.push({
      class: {
        lessons: {
          some: {
            teacherId: userId,
          },
        },
      },
    });
  }

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
        { class: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  const studentWhere: Prisma.StudentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  /* ======================================================
     2. SORT STUDENT (THEO LỚP)
  ====================================================== */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let studentOrderBy: Prisma.StudentOrderByWithRelationInput = {
    class: {
      name: "asc",
    },
  };

  if (sortBy === "class") {
    studentOrderBy = {
      class: {
        name: order,
      },
    };
  }

  /* ======================================================
     3. QUERY STUDENTS + PAGINATION
  ====================================================== */
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        name: true,
        surname: true,
        class: true,
      },
      orderBy: studentOrderBy,
      take: 14,
      skip: 14 * (p - 1),
    }),
    prisma.student.count({ where: studentWhere }),
  ]);

  if (students.length === 0) {
    return <div className="bg-white p-6 m-4 rounded-md">Không có học sinh</div>;
  }

  /* ======================================================
     4. LẤY RESULT LIÊN QUAN (CHỈ STUDENT TRONG PAGE)
  ====================================================== */
  const results = await prisma.result.findMany({
    where: {
      studentId: { in: students.map((s) => s.id) },
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
     5. BUILD MAP + TÍNH HỌC LỰC
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

  students.forEach((s) => {
    studentMap[s.id] = {
      studentName: `${s.surname} ${s.name}`,
      studentClass: s.class.name,
      subjects: {},
    };
  });

  results.forEach((r) => {
    const assessment = r.exam ?? r.assignment;
    if (!assessment) return;

    const subject = assessment.lesson.subject;
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

    if (r.exam) student.subjects[subjectKey].examScores.push(r.score);
    if (r.assignment)
      student.subjects[subjectKey].assignmentScores.push(r.score);
  });

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
      studentName: data.studentName,
      studentClass: data.studentClass,
      ...academic,
    };
  });

  /* ======================================================
     6. UI
  ====================================================== */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Học lực học sinh
        </h1>
        <TableSearch />
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-sm text-gray-500">Học sinh</th>
            <SortableTH label="Lớp" sortKey="class" />
            <th className="text-left text-sm text-gray-500">Số môn</th>
            <th className="text-left text-sm text-gray-500">Điểm TB</th>
            <th className="text-left text-sm text-gray-500">Xếp loại</th>
            <th className="text-left text-sm text-gray-500"></th>
          </tr>
        </thead>

        <tbody>
          {academicList.map((s) => (
            <tr
              key={s.studentId}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="p-4">{s.studentName}</td>
              <td className="">{s.studentClass}</td>
              <td className=" text-left">{s.subjectCount}</td>
              <td className=" text-left font-semibold">
                {s.academicAvg ?? "—"}
              </td>
              <td className=" text-left">{s.level}</td>
              <td className=" text-left">
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

      {/* PAGINATION */}
      <Pagination page={p} count={total} />
    </div>
  );
};

export default AcademicPage;
