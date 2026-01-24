// import Link from "next/link";
// import Image from "next/image";
// import { currentUser } from "@clerk/nextjs/server";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "🏠",
        label: "Trang chủ",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "🧑🏻‍🏫",
        label: "Giáo viên",
        href: "/list/teachers",
        visible: ["admin", "teacher", "parent"],
      },
      {
        icon: "🧑🏻‍🎓",
        label: "Học sinh",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "👱🏻",
        label: "Phụ huynh",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "📚",
        label: "Môn học",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "🎻",
        label: "Lớp học",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "⏳",
        label: "Tiết học",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "📝",
        label: "Kiểm tra",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "🖋️",
        label: "Bài luận",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "💯",
        label: "Điểm số",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "📊",
        label: "Học lực",
        href: "/list/academic",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "🔖",
        label: "Điểm danh",
        href: "/list/attendance",
        visible: ["admin", "teacher"],
      },
      {
        icon: "📇",
        label: "Điểm danh",
        href: "/parent/attendance",
        visible: ["parent"],
      },
      {
        icon: "📆",
        label: "Sự kiện",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "📨",
        label: "Tin nhắn",
        href: "/list/messages",
        visible: ["admin", "teacher", "parent"],
      },
      {
        icon: "📢",
        label: "Thông báo",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = ({ role }: { role: string }) => {
  const pathname = usePathname();

  return (
    <div className="text-sm p-4">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className="hidden lg:block text-white font-semibold my-4">
            {group.title}
          </span>

          {group.items.map((item) => {
            if (!item.visible.includes(role)) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex items-center justify-center lg:justify-start lg:pl-6 gap-4 py-2 md:px-2 rounded-md transition
                  ${
                    isActive
                      ? "bg-[#F2D25C] text-black scale-105"
                      : "text-white hover:bg-[#F2D25C] hover:text-black hover:scale-105"
                  }
                `}
              >
                <div className="w-6 h-6 text-lg text-center">{item.icon}</div>
                <span className="hidden lg:block text-md">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
// const menuItems = [
//   {
//     title: "MENU",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Trang chủ",
//         href: "/",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/teacher.png",
//         label: "Giáo viên",
//         href: "/list/teachers",
//         visible: ["admin", "teacher", "parent"],
//       },
//       {
//         icon: "/student.png",
//         label: "Học sinh",
//         href: "/list/students",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/parent.png",
//         label: "Phụ huynh",
//         href: "/list/parents",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Môn học",
//         href: "/list/subjects",
//         visible: ["admin"],
//       },
//       {
//         icon: "/class.png",
//         label: "Lớp học",
//         href: "/list/classes",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Tiết học",
//         href: "/list/lessons",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/exam.png",
//         label: "Kiểm tra",
//         href: "/list/exams",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "Bài luận",
//         href: "/list/assignments",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/result.png",
//         label: "Điểm số",
//         href: "/list/results",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/academic.png",
//         label: "Học lực",
//         href: "/list/academic",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/attendance.png",
//         label: "Điểm danh",
//         href: "/list/attendance",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/attendance.png",
//         label: "Điểm danh",
//         href: "/parent/attendance",
//         visible: ["parent"],
//       },
//       {
//         icon: "/calendar.png",
//         label: "Sự kiện",
//         href: "/list/events",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/message.png",
//         label: "Tin nhắn",
//         href: "/list/messages",
//         visible: ["admin", "teacher", "parent"],
//       },
//       {
//         icon: "/announcement.png",
//         label: "Thông báo",
//         href: "/list/announcements",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//     ],
//   },
// ];

// const Menu = async () => {
//   const user = await currentUser();
//   const role = user?.publicMetadata.role as string;
//   return (
//     <div className="text-sm p-4">
//       {menuItems.map((i) => (
//         <div className="flex flex-col gap-2 " key={i.title}>
//           <span className="hidden lg:block text-white font-semibold my-4">
//             {i.title}
//           </span>
//           {i.items.map((item) => {
//             if (item.visible.includes(role)) {
//               return (
//                 <Link
//                   href={item.href}
//                   key={item.label}
//                   className="flex items-center justify-center lg:justify-start lg:pl-6 gap-4 text-white py-2 md:px-2 rounded-md hover:bg-[#F2D25C] hover:text-black hover:scale-105"
//                 >
//                   {/* <Image src={item.icon} alt="" width={20} height={20} /> */}
//                   <div className="w-6 h-6 justify-center items-center text-center text-lg">
//                     {item.icon}
//                   </div>
//                   <span className="hidden lg:block justify-center items-center text-md">
//                     {item.label}
//                   </span>
//                 </Link>
//               );
//             }
//           })}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Menu;
