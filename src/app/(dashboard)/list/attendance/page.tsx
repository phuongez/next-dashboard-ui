import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

type AttendanceLessonRow = {
  id: number;
  name: string;
  day: string;
  startTime: Date;
  endTime: Date;
  className: string;
  subjectName: string;
  attendanceCount: number;
  attendanceRate: number;
};

const AttendancePage = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, search } = (await searchParams) || {};
  const p = page ? parseInt(page) : 1;

  /* ================= QUERY CONDITION ================= */

  const where: Prisma.LessonWhereInput = {
    ...(role === "teacher" ? { teacherId: userId! } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            {
              class: {
                name: { contains: search, mode: "insensitive" },
              },
            },
            {
              subject: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  /* ================= DATA ================= */

  const [lessons, count] = await Promise.all([
    prisma.lesson.findMany({
      where,
      include: {
        class: {
          include: {
            students: {
              select: { id: true },
            },
          },
        },
        subject: true,
        attendances: true,
      },
      orderBy: { startTime: "desc" },
      take: 14,
      skip: (p - 1) * 14,
    }),
    prisma.lesson.count({ where }),
  ]);

  const data = lessons.map((lesson) => {
    const totalStudents = lesson.class.students.length;
    const presentCount = lesson.attendances.filter((a) => a.present).length;

    return {
      id: lesson.id,
      name: lesson.name,
      day: lesson.day,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      subjectName: lesson.subject.name,
      className: lesson.class.name,
      attendanceCount: presentCount,
      attendanceRate: `${presentCount}/${totalStudents}`,
    };
  });

  /* ================= TABLE ================= */

  const columns = [
    { header: "Tiết học", accessor: "name" },
    { header: "Lớp", accessor: "class" },
    { header: "Môn", accessor: "subject" },
    {
      header: "Ngày",
      accessor: "day",
      className: "hidden md:table-cell",
    },
    {
      header: "Thời gian",
      accessor: "time",
      className: "hidden md:table-cell",
    },
    {
      header: "Chuyên cần",
      accessor: "attendanceRate",
    },
    { header: "Điểm danh", accessor: "attendance" },
    ...(role === "teacher"
      ? [{ header: "Hành động", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: AttendanceLessonRow) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm hover:bg-gray-100"
    >
      <td className="p-4 font-medium">{item.name}</td>
      <td>{item.className}</td>
      <td>{item.subjectName}</td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleDateString("vi-VN")}
      </td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {item.endTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="font-medium">{item.attendanceRate}</td>
      <td>
        {item.attendanceCount > 0 ? (
          <span className="text-green-600 font-medium">Đã điểm danh</span>
        ) : (
          <span className="text-red-500 font-medium">Chưa điểm danh</span>
        )}
      </td>

      {role === "teacher" && (
        <td>
          <Link
            href={`/list/attendance/${item.id}`}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/update.png" alt="" width={14} height={14} />
            </button>
          </Link>
        </td>
      )}
    </tr>
  );

  /* ================= UI ================= */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Điểm danh theo tiết học
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendancePage;
