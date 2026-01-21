import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ParentAttendanceList from "./ParentAttendanceList";

const ParentAttendancePage = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  // 1. Lấy danh sách con của phụ huynh
  const students = await prisma.student.findMany({
    where: {
      parentId: userId,
    },
    select: {
      id: true,
      name: true,
      surname: true,
    },
  });

  const studentIds = students.map((s) => s.id);

  // 2. Lấy attendance của các con
  const attendances = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
    },
    include: {
      student: true,
      lesson: {
        include: {
          subject: true,
          class: true,
        },
      },
    },
    orderBy: {
      lesson: { startTime: "desc" },
    },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <ParentAttendanceList students={students} attendances={attendances} />
    </div>
  );
};

export default ParentAttendancePage;
