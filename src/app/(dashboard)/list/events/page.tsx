import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@/generated/prisma/client";

const EventListPage = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, search } = (await searchParams) || {};
  const p = page ? parseInt(page) : 1;

  /* ================= WHERE ================= */
  const where: Prisma.EventWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    where.OR = [
      { classId: null },
      {
        class: {
          lessons: {
            some: { teacherId: userId! },
          },
        },
      },
    ];
  }

  if (role === "student") {
    where.OR = [
      { classId: null },
      {
        class: {
          students: {
            some: { id: userId! },
          },
        },
      },
    ];
  }

  if (role === "parent") {
    where.OR = [
      { classId: null },
      {
        class: {
          students: {
            some: { parentId: userId! },
          },
        },
      },
    ];
  }

  // ADMIN → KHÔNG FILTER GÌ CẢ
  // admin xem tất cả event

  /* ================= QUERY ================= */
  const [events, count] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { class: true },
      orderBy: { startTime: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where }),
  ]);

  /* ================= UI ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả sự kiện
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && <FormContainer table="event" type="create" />}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-sm text-gray-500">Tên sự kiện</th>
            <th className="text-left text-sm text-gray-500">Phạm vi</th>
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Ngày
            </th>
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Bắt đầu
            </th>
            <th className="text-left text-sm text-gray-500 hidden md:table-cell">
              Kết thúc
            </th>
            {role === "admin" && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {events.map((e) => (
            <tr
              key={e.id}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="p-4">{e.title}</td>

              <td className="">{e.class ? e.class.name : "Toàn trường"}</td>

              <td className="hidden md:table-cell ">
                {new Intl.DateTimeFormat("vi-VN").format(e.startTime)}
              </td>

              <td className="hidden md:table-cell ">
                {e.startTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>

              <td className="hidden md:table-cell ">
                {e.endTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>

              {role === "admin" && (
                <td className="">
                  <div className="flex gap-2">
                    <FormContainer table="event" type="update" data={e} />
                    <FormContainer table="event" type="delete" id={e.id} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;
