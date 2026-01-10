"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateConversation } from "@/lib/actions";

type Props = {
  teacherId: string;
  parentId: string;
  studentId: string;
};

const StartChatButton = ({ teacherId, parentId, studentId }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const conversationId = await getOrCreateConversation({
        teacherId,
        parentId,
        studentId,
      });

      router.push(`/messages/${conversationId}`);
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-lamaYellowLight  px-3 py-1 rounded-md text-sm"
    >
      Nhắn tin
    </button>
  );
};

export default StartChatButton;
