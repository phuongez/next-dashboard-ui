import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import NavbarNotification from "./navbar/NavbarNotification";
import NavbarMessages from "./NavbarMessages";
import { prisma } from "@/lib/prisma";

const Navbar = async () => {
  const user = await currentUser();
  const pageRole = user?.publicMetadata.role as string;
  const prismaUser: any =
    pageRole === "teacher"
      ? await prisma.teacher.findUnique({
          where: {
            id: user?.id as string,
          },
        })
      : pageRole === "parent"
      ? await prisma.parent.findUnique({
          where: {
            id: user?.id as string,
          },
        })
      : pageRole === "student"
      ? await prisma.student.findUnique({
          where: {
            id: user?.id as string,
          },
        })
      : pageRole === "admin"
      ? await prisma.admin.findUnique({
          where: {
            id: user?.id as string,
          },
        })
      : null;
  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex md:w-1/2 items-center px-2">
        {/* <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        /> */}
        <h1 className="font-semibold">
          Chào mừng {user?.firstName},{" "}
          <span className="font-normal">Đến với trang quản lý lịch học</span>
        </h1>
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <NavbarMessages />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <NavbarNotification />
        </div>
        <div className="flex flex-col">
          {pageRole === "admin" && (
            <span className="text-xs leading-3 font-medium">
              {user?.lastName + " " + user?.firstName}
            </span>
          )}
          {pageRole !== "admin" && (
            <span className="text-xs leading-3 font-medium">
              {prismaUser?.surname + " " + prismaUser?.name}
            </span>
          )}

          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
