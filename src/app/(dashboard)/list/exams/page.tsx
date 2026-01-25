import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import SortableTH from "../students/SortableTH";

export default async function ExamListPage({
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
  const where: Prisma.ExamWhereInput = {
    lesson: {},
  };

  if (queryParams.classId) {
    where.lesson!.classId = parseInt(queryParams.classId);
  }

  if (queryParams.teacherId) {
    where.lesson!.teacherId = queryParams.teacherId;
  }

  if (queryParams.search) {
    where.lesson!.subject = {
      name: {
        contains: queryParams.search,
        mode: "insensitive",
      },
    };
  }

  // ROLE CONDITIONS
  switch (role) {
    case "teacher":
      where.lesson!.teacherId = userId!;
      break;

    case "student":
      where.lesson!.class = {
        students: {
          some: { id: userId! },
        },
      };
      break;

    case "parent":
      where.lesson!.class = {
        students: {
          some: { parentId: userId! },
        },
      };
      break;

    default:
      break;
  }

  /* ================= SORT ================= */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.ExamOrderByWithRelationInput = {
    startTime: "desc", // default
  };

  if (sortBy === "subject") {
    orderBy = {
      lesson: {
        subject: {
          name: order,
        },
      },
    };
  }

  if (sortBy === "class") {
    orderBy = {
      lesson: {
        class: {
          name: order,
        },
      },
    };
  }

  if (sortBy === "date") {
    orderBy = {
      startTime: order,
    };
  }

  /* ================= QUERY ================= */
  const [exams, count] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      orderBy,
      take: 14,
      skip: (p - 1) * 14,
    }),
    prisma.exam.count({ where }),
  ]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả bài kiểm tra
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="exam" type="create" />
          )}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm text-gray-500">Tên bài</th>
            <SortableTH label="Môn" sortKey="subject" />
            <SortableTH label="Lớp" sortKey="class" />
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Giáo viên
            </th>
            <SortableTH label="Ngày kiểm tra" sortKey="date" />
            {(role === "admin" || role === "teacher") && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {exams.map((e) => (
            <tr
              key={e.id}
              className="border-b border-gray-200 text-sm hover:bg-gray-100"
            >
              <td className="p-4">{e.title}</td>

              <td className="">{e.lesson.subject.name}</td>

              <td className="">{e.lesson.class.name}</td>

              <td className="hidden md:table-cell">
                {e.lesson.teacher.surname} {e.lesson.teacher.name}
              </td>

              <td className="">
                {new Intl.DateTimeFormat("vi-VN").format(e.startTime)}
              </td>

              {(role === "admin" || role === "teacher") && (
                <td>
                  <div className="flex items-center gap-2">
                    <FormContainer table="exam" type="update" data={e} />
                    <FormContainer table="exam" type="delete" id={e.id} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
