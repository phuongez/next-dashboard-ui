import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import SortableTH from "../students/SortableTH";

export default async function ResultListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, sortBy, sortOrder, ...queryParams } =
    (await searchParams) || {};
  const p = page ? parseInt(page) : 1;

  /* ================= FILTER ================= */
  const where: Prisma.ResultWhereInput = {};

  if (queryParams.search) {
    where.OR = [
      {
        student: {
          name: { contains: queryParams.search, mode: "insensitive" },
        },
      },
      {
        student: {
          surname: { contains: queryParams.search, mode: "insensitive" },
        },
      },
      {
        exam: { title: { contains: queryParams.search, mode: "insensitive" } },
      },
      {
        assignment: {
          title: { contains: queryParams.search, mode: "insensitive" },
        },
      },
    ];
  }

  // ROLE CONDITIONS
  switch (role) {
    case "teacher":
      where.OR = [
        { exam: { lesson: { teacherId: userId! } } },
        { assignment: { lesson: { teacherId: userId! } } },
      ];
      break;

    case "student":
      where.studentId = userId!;
      break;

    case "parent":
      where.student = { parentId: userId! };
      break;

    default:
      break;
  }

  /* ================= SORT ================= */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.ResultOrderByWithRelationInput = {};

  if (sortBy === "score") {
    orderBy = { score: order };
  }

  if (sortBy === "subject") {
    orderBy = {
      exam: {
        lesson: {
          subject: { name: order },
        },
      },
    };
  }

  if (sortBy === "class") {
    orderBy = {
      exam: {
        lesson: {
          class: { name: order },
        },
      },
    };
  }

  /* ================= QUERY ================= */
  const [results, count] = await Promise.all([
    prisma.result.findMany({
      where,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: { select: { name: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy,
      take: 14,
      skip: 14 * (p - 1),
    }),
    prisma.result.count({ where }),
  ]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả điểm số
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="result" type="create" />
          )}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm text-gray-500">Học sinh</th>
            <SortableTH label="Lớp" sortKey="class" />
            <th className="text-left text-sm text-gray-500">Bài</th>
            <SortableTH label="Môn" sortKey="subject" />
            <SortableTH label="Điểm" sortKey="score" />
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Giáo viên
            </th>
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Ngày
            </th>
            {(role === "admin" || role === "teacher") && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {results.map((r) => {
            const assessment = r.exam || r.assignment;
            if (!assessment) return null;

            const startTime =
              "startTime" in assessment
                ? assessment.startTime
                : assessment.startDate;

            return (
              <tr
                key={r.id}
                className="border-b border-gray-200 text-sm hover:bg-gray-100"
              >
                <td className="p-4">
                  {r.student.surname} {r.student.name}
                </td>

                <td className="">{assessment.lesson.class.name}</td>

                <td className="">{assessment.title}</td>

                <td className="">{assessment.lesson.subject.name}</td>

                <td className=" font-semibold">{r.score}</td>

                <td className="hidden md:table-cell">
                  {assessment.lesson.teacher.surname}{" "}
                  {assessment.lesson.teacher.name}
                </td>

                <td className="hidden md:table-cell">
                  {new Intl.DateTimeFormat("vi-VN").format(startTime)}
                </td>

                {(role === "admin" || role === "teacher") && (
                  <td>
                    <div className="flex items-center gap-2">
                      <FormContainer table="result" type="update" data={r} />
                      <FormContainer table="result" type="delete" id={r.id} />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
