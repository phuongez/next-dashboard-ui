import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import MessageForm from "@/components/forms/MessageForm";
import { markConversationAsRead } from "@/lib/actions";

type Props = {
  params: {
    id: string;
  };
};

const MessageDetailPage = async ({ params }: Props) => {
  const { id } = await params; // ✅ unwrap params trước

  const conversationId = Number(id);
  if (isNaN(conversationId)) return notFound();

  const { userId, sessionClaims } = await auth();
  if (!userId) return notFound();

  const role = (sessionClaims?.metadata as any)?.role;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      student: {
        select: { name: true, surname: true },
      },
      teacher: {
        select: { name: true, surname: true },
      },
      parent: {
        select: { name: true, surname: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) return notFound();

  // 🔐 CHECK QUYỀN
  const isAllowed =
    userId === conversation.teacherId || userId === conversation.parentId;

  if (!isAllowed) return notFound();

  const otherUserName =
    role === "teacher"
      ? `${conversation.parent.name} ${conversation.parent.surname}`
      : `${conversation.teacher.name} ${conversation.teacher.surname}`;

  await markConversationAsRead(conversation.id, userId);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* ===== HEADER ===== */}
      <div className="border-b p-4">
        <h1 className="font-semibold text-lg">{otherUserName}</h1>
        <p className="text-sm text-gray-500">
          Học sinh: {conversation.student.name} {conversation.student.surname}
        </p>
      </div>

      {/* ===== MESSAGES ===== */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {conversation.messages.map((msg) => {
          const isMine = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              className={`max-w-[70%] px-4 py-2 rounded-md text-sm ${
                isMine
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              <p>{msg.content}</p>
              <span className="block text-[10px] mt-1 opacity-70">
                {new Date(msg.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* ===== INPUT ===== */}
      <div className="border-t p-4">
        <MessageForm conversationId={conversation.id} />
      </div>
    </div>
  );
};

export default MessageDetailPage;
