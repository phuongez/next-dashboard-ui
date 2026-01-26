"use client";

import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

export const menuItems = [
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
  return (
    <div className="p-4">
      <DesktopSidebar role={role} />
      <MobileSidebar role={role} />
    </div>
  );
};

export default Menu;
