import Link from "next/link";
import { Bell } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUnreadAnnouncementCount } from "@/lib/notifications";

const NavbarNotification = async () => {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const role = (sessionClaims?.metadata as any)?.role;

  let classIds: number[] | undefined = undefined;

  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { classId: true },
    });
    classIds = student ? [student.classId] : [];
  }

  if (role === "parent") {
    const students = await prisma.student.findMany({
      where: { parentId: userId },
      select: { classId: true },
    });
    classIds = students.map((s) => s.classId);
  }

  const count = await getUnreadAnnouncementCount({
    role,
    classIds,
  });

  return (
    <Link href="/list/announcements" className="relative flex items-center">
      <Bell className="w-5 h-5 text-gray-600" />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
          {count}
        </span>
      )}
    </Link>
  );
};

export default NavbarNotification;
