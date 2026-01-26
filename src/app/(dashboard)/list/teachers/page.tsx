import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import SortableTH from "@/app/(dashboard)/list/students/SortableTH";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default async function TeacherListPage({
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
  const where: Prisma.TeacherWhereInput = {};

  if (queryParams.search) {
    where.OR = [
      {
        name: { contains: queryParams.search, mode: "insensitive" },
      },
      {
        surname: {
          contains: queryParams.search,
          mode: "insensitive",
        },
      },
      {
        subjects: {
          some: {
            name: {
              contains: queryParams.search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (queryParams.classId) {
    where.lessons = {
      some: {
        classId: parseInt(queryParams.classId),
      },
    };
  }

  if (role === "parent") {
    where.lessons = {
      some: {
        class: {
          students: {
            some: {
              parentId: userId!,
            },
          },
        },
      },
    };
  }

  /* ================= SORT ================= */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let orderBy:
    | Prisma.TeacherOrderByWithRelationInput
    | Prisma.TeacherOrderByWithRelationInput[] = {
    createdAt: "desc",
  };

  if (sortBy === "info") {
    orderBy = [{ name: order }, { surname: order }];
  }

  if (sortBy === "subject") {
    orderBy = {
      subjects: {
        _count: order, // sort theo số lượng bộ môn (ổn định & Prisma-safe)
      },
    };
  }

  /* ================= QUERY ================= */
  const [teachers, count] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.teacher.count({ where }),
  ]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả giáo viên
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && <FormContainer table="teacher" type="create" />}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <SortableTH label="Thông tin" sortKey="info" />
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              ID giáo viên
            </th>
            <th className="hidden lg:table-cell text-left text-sm text-gray-500">
              Bộ môn
            </th>
            <th className="hidden lg:table-cell text-left text-sm text-gray-500">
              Lớp CN
            </th>

            <th className="hidden lg:table-cell text-left text-sm text-gray-500">
              Điện thoại
            </th>
            <th className="hidden lg:table-cell text-left text-sm text-gray-500">
              Địa chỉ
            </th>
            {role === "admin" && (
              <th className="text-left text-sm text-gray-500">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {teachers.map((t) => (
            <tr
              key={t.id}
              className="border-b border-gray-200 text-sm hover:bg-gray-100"
            >
              <td className="flex items-center gap-4 p-4">
                <Image
                  src={t.img || "/noAvatar.png"}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">
                    {t.surname} {t.name}
                  </div>
                  <div className="text-xs text-gray-500">{t.email}</div>
                </div>
              </td>

              <td className="hidden md:table-cell">{t.username}</td>

              <td className="hidden md:table-cell">
                {t.subjects.map((s) => s.name).join(", ")}
              </td>

              <td className="hidden md:table-cell">
                {t.classes.map((c) => c.name).join(", ")}
              </td>

              <td className="hidden lg:table-cell">{t.phone}</td>

              <td className="hidden lg:table-cell">{t.address}</td>

              {role === "admin" && (
                <td>
                  <div className="flex items-center gap-2">
                    <Link href={`/list/teachers/${t.id}`}>
                      <button className="group w-7 h-7 relative flex items-center justify-center rounded-full bg-lamaYellow">
                        <Image src="/view.png" alt="" width={16} height={16} />
                        <span
                          className="
      absolute top-full mt-2
      whitespace-nowrap
      rounded bg-black px-2 py-1
      text-xs text-white
      opacity-0
      transition
      group-hover:opacity-100
      pointer-events-none
    "
                        >
                          Xem
                        </span>
                      </button>
                    </Link>
                    <FormContainer table="teacher" type="delete" id={t.id} />
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

// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import { Subject, Teacher, Class, Prisma } from "@/generated/prisma/client";
// import Image from "next/image";
// import Link from "next/link";

// import { ITEM_PER_PAGE } from "@/lib/settings";

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "@/generated/prisma/client";
// // import { role } from "@/lib/utils";
// import FormContainer from "@/components/FormContainer";
// import { auth } from "@clerk/nextjs/server";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// type TeacherList = Teacher & {
//   subjects: Subject[];
//   classes: Class[];
// };

// const TeacherListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string } | undefined;
// }) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const columns = [
//     {
//       header: "Thông tin",
//       accessor: "info",
//     },
//     {
//       header: "ID giáo viên",
//       accessor: "teacherId",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Bộ môn",
//       accessor: "subjects",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Lớp",
//       accessor: "classes",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Điện thoại",
//       accessor: "phone",
//       className: "hidden lg:table-cell",
//     },
//     {
//       header: "Địa chỉ",
//       accessor: "address",
//       className: "hidden lg:table-cell",
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

//   const renderRow = (item: TeacherList) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200  text-sm hover:bg-slate-100"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <Image
//           src={item.img || "/noAvatar.png"}
//           alt=""
//           width={40}
//           height={40}
//           className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
//         />
//         <div className="flex flex-col">
//           <h3 className="font-semibold">{item.surname + " " + item.name}</h3>
//           <p className="text-xs text-gray-500">{item.email}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{item.username}</td>
//       <td className="hidden md:table-cell">
//         {item.subjects.map((item) => item.name).join(", ")}
//       </td>
//       <td className="hidden md:table-cell">
//         {item.classes.map((item) => item.name).join(", ")}
//       </td>
//       <td className="hidden lg:table-cell">{item.phone}</td>
//       <td className="hidden lg:table-cell">{item.address}</td>
//       {role === "admin" && (
//         <td>
//           <div className="flex items-center gap-2">
//             <Link href={`/list/teachers/${item.id}`}>
//               <button className="group w-7 h-7 relative flex items-center justify-center rounded-full bg-lamaSky">
//                 <Image src="/view.png" alt="" width={16} height={16} />
//                 <span
//                   className="
//       absolute top-full mt-2
//       whitespace-nowrap
//       rounded bg-lamaYellow px-2 py-1
//       text-xs text-white
//       opacity-0
//       transition
//       group-hover:opacity-100
//       pointer-events-none
//     "
//                 >
//                   Xem
//                 </span>
//               </button>
//             </Link>
//             {role === "admin" && (
//               <FormContainer table="teacher" type="delete" id={item.id} />
//             )}
//           </div>
//         </td>
//       )}
//     </tr>
//   );

//   const { page, ...queryParams } = (await searchParams) || {};

//   const p = page ? parseInt(page) : 1;

//   // URL PARAMS CONDITION

//   const query: Prisma.TeacherWhereInput = {};

//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "classId":
//             query.lessons = {
//               some: {
//                 classId: parseInt(value!),
//               },
//             };
//             break;
//           case "search":
//             query.OR = [
//               {
//                 name: {
//                   contains: value,
//                   mode: "insensitive",
//                 },
//               },
//               {
//                 subjects: {
//                   some: {
//                     name: {
//                       contains: value,
//                       mode: "insensitive",
//                     },
//                   },
//                 },
//               },
//             ];
//             break;
//           default:
//             break;
//         }
//       }
//     }
//   }

//   switch (role) {
//     case "parent":
//       query.lessons = {
//         some: {
//           class: {
//             students: {
//               some: {
//                 parentId: userId!,
//               },
//             },
//           },
//         },
//       };
//       break;
//     case "admin":
//       break;
//     default:
//       break;
//   }

//   const [data, count] = await Promise.all([
//     prisma.teacher.findMany({
//       where: query,
//       include: {
//         subjects: true,
//         classes: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: ITEM_PER_PAGE,
//       skip: (p - 1) * ITEM_PER_PAGE,
//     }),

//     prisma.teacher.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">
//           Tất cả giáo viên
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
//             {role === "admin" && (
//               // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               //   <Image src={"/plus.png"} alt="" width={14} height={14} />
//               // </button>
//               <FormContainer table="teacher" type="create" />
//             )}
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

// export default TeacherListPage;
