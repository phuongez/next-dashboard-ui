import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import SortableTH from "../students/SortableTH";

export default async function AssignmentListPage({
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
  const where: Prisma.AssignmentWhereInput = {
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

  let orderBy: Prisma.AssignmentOrderByWithRelationInput = {
    dueDate: "desc", // default
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

  if (sortBy === "due") {
    orderBy = {
      dueDate: order,
    };
  }

  /* ================= QUERY ================= */
  const [assignments, count] = await Promise.all([
    prisma.assignment.findMany({
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
      skip: 14 * (p - 1),
    }),
    prisma.assignment.count({ where }),
  ]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả bài luận
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="assignment" type="create" />
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
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Giáo viên
            </th>
            <SortableTH label="Ngày đến hạn" sortKey="due" />
            {(role === "admin" || role === "teacher") && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {assignments.map((a) => (
            <tr
              key={a.id}
              className="border-b border-gray-200 text-sm hover:bg-gray-100"
            >
              <td className="p-4">{a.title}</td>

              <td className="">{a.lesson.subject.name}</td>

              <td className="">{a.lesson.class.name}</td>

              <td className="hidden md:table-cell">
                {a.lesson.teacher.surname} {a.lesson.teacher.name}
              </td>

              <td className="">
                {new Intl.DateTimeFormat("vi-VN").format(a.dueDate)}
              </td>

              {(role === "admin" || role === "teacher") && (
                <td>
                  <div className="flex items-center gap-2">
                    <FormContainer table="assignment" type="update" data={a} />
                    <FormContainer table="assignment" type="delete" id={a.id} />
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
