import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import SortableTH from "../students/SortableTH";

export default async function LessonListPage({
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
  const where: Prisma.LessonWhereInput = {};

  if (queryParams.classId) {
    where.classId = parseInt(queryParams.classId);
  }

  if (queryParams.teacherId) {
    where.teacherId = queryParams.teacherId;
  }

  if (queryParams.search) {
    where.OR = [
      {
        subject: {
          name: { contains: queryParams.search, mode: "insensitive" },
        },
      },
      {
        class: { name: { contains: queryParams.search, mode: "insensitive" } },
      },
      {
        teacher: {
          name: { contains: queryParams.search, mode: "insensitive" },
        },
      },
    ];
  }

  if (role === "teacher") {
    where.teacherId = userId!;
  }

  /* ================= SORT ================= */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.LessonOrderByWithRelationInput = {
    startTime: "desc",
  };

  if (sortBy === "subject") {
    orderBy = {
      subject: {
        name: order,
      },
    };
  }

  if (sortBy === "class") {
    orderBy = {
      class: {
        name: order,
      },
    };
  }

  if (sortBy === "date") {
    orderBy = {
      startTime: order,
    };
  }

  /* ================= QUERY ================= */
  const [lessons, count] = await Promise.all([
    prisma.lesson.findMany({
      where,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        attendances: { select: { id: true } }, // 👈 để xác định đã điểm danh
        exams: { select: { id: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.lesson.count({ where }),
  ]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả tiết học
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && <FormContainer table="lesson" type="create" />}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <SortableTH label="Môn học" sortKey="subject" />
            <SortableTH label="Lớp" sortKey="class" />
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Giáo viên
            </th>
            <SortableTH label="Ngày" sortKey="date" />
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Thời gian
            </th>
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Kiểm tra
            </th>
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Hoàn thành
            </th>
            {role === "admin" && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {lessons.map((l) => {
            const isCompleted = l.attendances.length > 0;

            return (
              <tr
                key={l.id}
                className="border-b border-gray-200 text-sm hover:bg-gray-100"
              >
                <td className="p-4">{l.subject.name}</td>
                <td className="">{l.class.name}</td>

                <td className="hidden md:table-cell">
                  {l.teacher.surname} {l.teacher.name}
                </td>

                <td className="">
                  {new Intl.DateTimeFormat("vi-VN").format(l.startTime)}
                </td>

                <td className="hidden md:table-cell">
                  {l.startTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {l.endTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="hidden md:table-cell text-left">
                  {l.exams.length > 0 ? "Có" : "—"}
                </td>
                <td className="hidden md:table-cell text-left">
                  {isCompleted ? "✅" : "—"}
                </td>

                {role === "admin" && (
                  <td>
                    <div className="flex items-center gap-2">
                      <FormContainer table="lesson" type="update" data={l} />
                      <FormContainer table="lesson" type="delete" id={l.id} />
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

// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import {
//   Class,
//   Lesson,
//   Prisma,
//   Subject,
//   Teacher,
// } from "@/generated/prisma/client";
// import { prisma } from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { auth } from "@clerk/nextjs/server";

// type LessonList = Lesson & { subject: Subject; class: Class; teacher: Teacher };

// const LessonListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string } | undefined;
// }) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;
//   const currentUserId = userId;

//   const columns = [
//     {
//       header: "Tên môn",
//       accessor: "name",
//     },
//     {
//       header: "Lớp",
//       accessor: "class",
//       // className: "hidden md:table-cell",
//     },
//     {
//       header: "Giáo viên",
//       accessor: "grade",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Ngày",
//       accessor: "day",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Thời gian",
//       accessor: "time",
//       className: "hidden md:table-cell",
//     },
//     ...(role === "admin"
//       ? [
//           {
//             header: "Actions",
//             accessor: "action",
//           },
//         ]
//       : []),
//   ];

//   const renderRow = (item: LessonList) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 text-sm hover:bg-gray-100"
//     >
//       <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
//       <td className="">{item.class.name}</td>
//       <td className="hidden md:table-cell">
//         {item.teacher.surname + " " + item.teacher.name}
//       </td>
//       <td className="hidden md:table-cell">
//         {new Intl.DateTimeFormat("vi-VN").format(item.startTime)}
//       </td>
//       <td className="hidden md:table-cell">
//         {item.startTime.toLocaleTimeString("vi-VN", {
//           hour: "2-digit",
//           minute: "2-digit",
//         })}{" "}
//         -{" "}
//         {item.endTime.toLocaleTimeString("vi-VN", {
//           hour: "2-digit",
//           minute: "2-digit",
//         })}
//       </td>
//       <td>
//         <div className="flex items-center gap-2">
//           {role === "admin" && (
//             <>
//               <FormContainer table="lesson" type="update" data={item} />
//               <FormContainer table="lesson" type="delete" id={item.id} />
//             </>
//           )}
//         </div>
//       </td>
//     </tr>
//   );
//   const { page, ...queryParams } = (await searchParams) || {};

//   const p = page ? parseInt(page) : 1;

//   // URL PARAMS CONDITION

//   const query: Prisma.LessonWhereInput = {};
//   // query.lesson = {};

//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "classId":
//             query.classId = parseInt(value);
//             break;
//           case "teacherId":
//             query.teacherId = value;
//             break;
//           case "search":
//             query.OR = [
//               { subject: { name: { contains: value, mode: "insensitive" } } },
//               { teacher: { name: { contains: value, mode: "insensitive" } } },
//               { class: { name: { contains: value, mode: "insensitive" } } },
//             ];
//             break;
//         }
//       }
//     }
//   }

//   // ROLE CONDITIONS

//   switch (role) {
//     case "admin":
//       break;
//     case "teacher":
//       query.teacherId = currentUserId!;
//       break;
//     // case "student":
//     //   query.lesson.class = {
//     //     students: {
//     //       some: {
//     //         id: currentUserId!,
//     //       },
//     //     },
//     //   };
//     //   break;
//     // case "parent":
//     //   query.lesson.class = {
//     //     students: {
//     //       some: {
//     //         parentId: currentUserId!,
//     //       },
//     //     },
//     //   };
//     //   break;

//     default:
//       break;
//   }

//   const [data, count] = await Promise.all([
//     prisma.lesson.findMany({
//       where: query,
//       include: {
//         subject: { select: { name: true } },
//         class: { select: { name: true } },
//         teacher: { select: { name: true, surname: true } },
//       },
//       take: 15,
//       skip: (p - 1) * ITEM_PER_PAGE,
//     }),

//     prisma.lesson.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">
//           Tất cả tiết học
//         </h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2D25C]">
//               <Image src={"/filter.png"} alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2D25C]">
//               <Image src={"/sort.png"} alt="" width={14} height={14} />
//             </button> */}
//             {role === "admin" && <FormContainer table="lesson" type="create" />}
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       <Table columns={columns} renderRow={renderRow} data={data} />
//       {/* PAGINATION */}

//       <Pagination page={p} count={count} />
//     </div>
//   );
// };

// export default LessonListPage;
