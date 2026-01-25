import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import NavbarNotification from "./navbar/NavbarNotification";
import NavbarMessages from "./NavbarMessages";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div className="flex items-center justify-between p-4 lg:py-6">
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
        <div className="group bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <NavbarMessages />
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
            Tin nhắn
          </span>
        </div>
        <div className="group bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <NavbarNotification />
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
            Thông báo
          </span>
        </div>
        <Link
          href={"/"}
          className="flex items-center justify-center lg:justify-start gap-2 "
        >
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="hidden lg:block font-bold text-xl text-lamaYellow">
            ClassHours
          </span>
        </Link>
        {/* <div className="flex flex-col">
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
        </div> */}
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
