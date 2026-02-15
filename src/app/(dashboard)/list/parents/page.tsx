import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Parent, Prisma, Student } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormContainer from "@/components/FormContainer";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string } | undefined;
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Thông tin",
      accessor: "info",
    },
    {
      header: "ID",
      accessor: "id",
      className: "hidden lg:table-cell",
    },
    {
      header: "Tên học sinh",
      accessor: "students",
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

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm hover:bg-gray-100"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.surname + " " + item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      {role === "admin" && <td className="hidden lg:table-cell">{item.id}</td>}
      <td className="hidden lg:table-cell">
        {item.students.map((student, index) => (
          <span key={student.id}>
            <Link href={`/list/students/${student.id}`}>
              {student.surname.split(" ")[1] + " " + student.name}
            </Link>
            {index < item.students.length - 1 && ", "}
          </span>
        ))}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="parent"
                type="update"
                data={item}
                id={item.id}
              />
              <FormContainer table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = (await searchParams) || {};

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              {
                name: {
                  contains: value,
                  mode: "insensitive",
                },
              },
              {
                students: {
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
        }
      }
    }
  }

  const [data, count] = await Promise.all([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    prisma.parent.count({ where: query }),
  ]);
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Tất cả phụ huynh
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
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}

      <Pagination count={count} page={p} />
    </div>
  );
};

export default ParentListPage;
