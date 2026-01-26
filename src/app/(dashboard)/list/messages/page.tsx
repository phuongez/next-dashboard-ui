import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";

const InboxPage = async ({
  searchParams,
}: {
  searchParams?: { search?: string };
}) => {
  const searchString = await searchParams;
  const search = searchString?.search;
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const role = (sessionClaims?.metadata as any)?.role;

  // Lấy danh sách conversation của user
  const where: Prisma.ConversationWhereInput = {};
  if (role === "teacher") {
    where.teacherId = userId;
  }

  if (role === "parent") {
    where.parentId = userId;
  }

  if (search) {
    where.student = {
      OR: [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          surname: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      student: {
        select: {
          name: true,
          surname: true,
        },
      },
      teacher: {
        select: {
          name: true,
          surname: true,
        },
      },
      parent: {
        select: {
          name: true,
          surname: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Tin nhắn</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
          </div>
        </div>

        {conversations.length === 0 && (
          <p className="text-sm text-gray-500">Chưa có hội thoại nào</p>
        )}

        <div className="flex flex-col divide-y rounded-md border">
          {conversations.map((conv) => {
            const lastMessage = conv.messages[0];

            const otherUserName =
              role === "teacher"
                ? `${conv.parent.surname} ${conv.parent.name}`
                : `${conv.teacher.surname} ${conv.teacher.name}`;

            const isAdmin = role === "admin";

            return (
              <div
                key={conv.id}
                className="p-4 hover:bg-gray-50 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{otherUserName}</span>
                  <div className="flex flex-col gap-4">
                    {lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(lastMessage.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    )}
                    {(role === "parent" || role === "teacher") && (
                      <Link
                        href={`/list/messages/${conv.id}`}
                        className="group w-7 h-7 bg-lamaYellow flex items-center justify-center rounded-full relative"
                      >
                        <Image
                          src={"/view.png"}
                          alt=""
                          width={16}
                          height={16}
                        />
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
      z-50
    "
                        >
                          Xem
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  Học sinh: {conv.student.surname} {conv.student.name}
                </span>

                {lastMessage && (
                  <span className="text-sm text-gray-600 truncate">
                    {lastMessage.senderId === userId ? "Bạn: " : ""}
                    {lastMessage.content}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
