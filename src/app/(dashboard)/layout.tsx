import Link from "next/link";
import Image from "next/image";
import Menu from "../../components/Menu";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[16%] 2xl:w-[14%] bg-lamaYellow">
        {/* <Link
          href={"/"}
          className="flex items-center justify-center lg:justify-start gap-2 bg-[#F2D25C] p-4"
        >
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="hidden lg:block font-bold text-xl text-lamaYellow">
            ClassHours
          </span>
        </Link> */}
        <div className="hidden bg-white w-full lg:flex items-center p-8 gap-4 py-4">
          <Image
            src={user?.imageUrl || "/avatar.png"}
            alt=""
            width={60}
            height={60}
            className="object-cover rounded-xl"
          />
          <div className="flex-col hidden md:flex">
            <h1 className="font-bold">
              {user?.lastName} {user?.firstName}
            </h1>
            <h2 className="text-xs">Vai trò: {role}</h2>
          </div>
        </div>
        <Menu role={role} />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[84%] 2xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
