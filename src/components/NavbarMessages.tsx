import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getUnreadMessageCount } from "@/lib/messages";

const NavbarMessages = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const count = await getUnreadMessageCount(userId);

  return (
    <Link href="/list/messages" className="relative">
      <MessageCircle className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#F05A7E] text-white text-xs rounded-full px-1.5">
          {count}
        </span>
      )}
    </Link>
  );
};

export default NavbarMessages;
