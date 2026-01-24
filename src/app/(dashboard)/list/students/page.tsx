import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import StartChatButton from "@/components/StartChatButton";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { PrismaPg } from "@prisma/adapter-pg";
import SortableTH from "./SortableTH";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/* ================= SERVER PAGE ================= */
export default async function StudentListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { page, sortBy, sortOrder, ...queryParams } =
    (await searchParams) || {};

  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ===== FILTER ===== */
  const where: Prisma.StudentWhereInput = {};

  if (queryParams.search) {
    where.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { surname: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  /* ===== SORT ===== */
  const order: Prisma.SortOrder = sortOrder === "desc" ? "desc" : "asc";

  let orderBy:
    | Prisma.StudentOrderByWithRelationInput
    | Prisma.StudentOrderByWithRelationInput[] = { createdAt: "desc" };

  if (sortBy === "name") {
    orderBy = [{ name: order }, { surname: order }];
  }

  if (sortBy === "class") {
    orderBy = { class: { name: order } };
  }

  /* ===== QUERY ===== */
  const [students, count] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.student.count({ where }),
  ]);

  /* ===== RENDER ===== */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả học sinh
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && <FormContainer table="student" type="create" />}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <SortableTH label="Thông tin" sortKey="name" />
            <th className="hidden md:table-cell text-left text-sm text-gray-500">
              Id học sinh
            </th>
            <SortableTH
              label="Lớp"
              sortKey="class"
              style="hidden md:table-cell"
            />
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
          {students.map((s) => (
            <tr
              key={s.id}
              className="border-b border-gray-200 text-sm hover:bg-gray-100"
            >
              <td className="flex items-center gap-4 p-4">
                <Image
                  src={s.img || "/noAvatar.png"}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div>
                  <div className="font-semibold">
                    {s.surname} {s.name}
                  </div>
                  <div className="text-xs text-gray-500">{s.class.name}</div>
                </div>
              </td>

              <td className="hidden md:table-cell">{s.username}</td>
              <td className="hidden md:table-cell">{s.class.name}</td>
              <td className="hidden lg:table-cell">{s.phone}</td>
              <td className="hidden lg:table-cell">{s.address}</td>

              <td>
                <div className="flex items-center gap-2">
                  <Link href={`/list/students/${s.id}`}>
                    <button className="group w-7 h-7 relative flex items-center justify-center rounded-full bg-lamaPurple">
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

                  {role === "admin" ? (
                    <FormContainer table="student" type="delete" id={s.id} />
                  ) : (
                    <StartChatButton
                      teacherId={s.class.supervisorId}
                      parentId={s.parentId}
                      studentId={s.id}
                    />
                  )}
                </div>
              </td>
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
// import { Class, Prisma, Student } from "@/generated/prisma/client";
// import Image from "next/image";
// import Link from "next/link";

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "@/generated/prisma/client";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import FormContainer from "@/components/FormContainer";
// import { auth } from "@clerk/nextjs/server";
// import StartChatButton from "@/components/StartChatButton";

// import StudentTable from "./StudentTable.client";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// type StudentList = Student & { class: Class };

// const StudentListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string } | undefined;
// }) => {
//   const { page, sortBy, sortOrder, ...queryParams } =
//     (await searchParams) || {};

//   const p = page ? parseInt(page) : 1;

//   const { sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const columns = [
//     {
//       header: "Thông tin",
//       accessor: "info",
//       sortKey: "name",
//     },
//     {
//       header: "Id học sinh",
//       accessor: "studentId",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Lớp",
//       accessor: "class",
//       className: "hidden md:table-cell",
//       sortKey: "class",
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

//   const renderRow = (item: StudentList) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200  text-sm hover:bg-gray-100"
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
//           <h3 className="font-semibold">
//             {item.surname} {item.name}
//           </h3>
//           <p className="text-xs text-gray-500">{item.class.name}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{item.username}</td>
//       <td className="hidden md:table-cell">{item.class.name}</td>
//       <td className="hidden lg:table-cell">{item.phone}</td>
//       <td className="hidden lg:table-cell">{item.address}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           <Link href={`/list/students/${item.id}`}>
//             <button className="group w-7 h-7 relative flex items-center justify-center rounded-full bg-lamaSky">
//               <Image src="/view.png" alt="" width={16} height={16} />
//               <span
//                 className="
//       absolute top-full mt-2
//       whitespace-nowrap
//       rounded bg-black px-2 py-1
//       text-xs text-white
//       opacity-0
//       transition
//       group-hover:opacity-100
//       pointer-events-none
//     "
//               >
//                 Xem
//               </span>
//             </button>
//           </Link>
//           {role === "admin" && (
//             // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
//             //   <Image src="/delete.png" alt="" width={16} height={16} />
//             // </button>
//             <FormContainer table="student" type="delete" id={item.id} />
//           )}
//           {role !== "admin" && (
//             <StartChatButton
//               teacherId={item.class.supervisorId}
//               parentId={item.parentId}
//               studentId={item.id}
//             />
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   // URL PARAMS CONDITION

//   const query: Prisma.StudentWhereInput = {};

//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "teacherId":
//             query.class = {
//               lessons: {
//                 some: {
//                   teacherId: value,
//                 },
//               },
//             };
//             break;
//           case "search":
//             query.name = {
//               contains: value,
//               mode: "insensitive",
//             };
//             break;
//           default:
//             break;
//         }
//       }
//     }
//   }

//   const orderBy:
//     | Prisma.StudentOrderByWithRelationInput
//     | Prisma.StudentOrderByWithRelationInput[] = (() => {
//     if (!sortBy) {
//       return { createdAt: "desc" };
//     }

//     const order: Prisma.SortOrder = sortOrder === "asc" ? "asc" : "desc";

//     switch (sortBy) {
//       case "name":
//         return [{ surname: order }, { name: order }];

//       case "class":
//         return {
//           class: {
//             name: order,
//           },
//         };

//       default:
//         return { createdAt: "desc" };
//     }
//   })();

//   const [data, count] = await Promise.all([
//     prisma.student.findMany({
//       where: query,
//       include: {
//         class: true,
//       },
//       orderBy,
//       take: ITEM_PER_PAGE,
//       skip: (p - 1) * ITEM_PER_PAGE,
//     }),

//     prisma.student.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">
//           Tất cả học sinh
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
//               <FormContainer table="student" type="create" />
//             )}
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       {/* <StudentTable data={data} role={role} /> */}
//       <Table columns={columns} renderRow={renderRow} data={data} />
//       {/* PAGINATION */}

//       <Pagination page={p} count={count} />
//     </div>
//   );
// };

// export default StudentListPage;
