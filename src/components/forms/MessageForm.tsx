"use client";

import { useState, startTransition } from "react";
import { sendMessage } from "@/lib/actions";
import { useRouter } from "next/navigation";

type Props = {
  conversationId: number;
};

const MessageForm = ({ conversationId }: Props) => {
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSend = async () => {
    if (!content.trim()) return;

    startTransition(async () => {
      await sendMessage(conversationId, content);
      setContent("");
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="flex-1 ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 rounded-md"
      >
        Gửi
      </button>
    </div>
  );
};

export default MessageForm;
