import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Subject, Teacher, Class, Prisma } from "@/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";

import { ITEM_PER_PAGE } from "@/lib/settings";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
// import { role } from "@/lib/utils";
import FormContainer from "@/components/FormContainer";
import { auth } from "@clerk/nextjs/server";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type TeacherList = Teacher & {
  subjects: Subject[];
  classes: Class[];
};

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string } | undefined;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Thông tin",
      accessor: "info",
    },
    {
      header: "ID giáo viên",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Bộ môn",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Lớp",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Điện thoại",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Địa chỉ",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaSkyLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.surname + " " + item.name}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((item) => item.name).join(", ")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((item) => item.name).join(", ")}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/teachers/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            {role === "admin" && (
              <FormContainer table="teacher" type="delete" id={item.id} />
            )}
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = (await searchParams) || {};

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value!),
              },
            };
            break;
          case "search":
            query.OR = [
              {
                name: {
                  contains: value,
                  mode: "insensitive",
                },
              },
              {
                subjects: {
                  some: {
                    name: {
                      contains: value,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  switch (role) {
    case "parent":
      query.lessons = {
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
      break;
    case "admin":
      break;
    default:
      break;
  }

  const [data, count] = await Promise.all([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả giáo viên
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2D25C]">
              <Image src={"/filter.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2D25C]">
              <Image src={"/sort.png"} alt="" width={14} height={14} />
            </button> */}
            {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src={"/plus.png"} alt="" width={14} height={14} />
              // </button>
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}

      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
