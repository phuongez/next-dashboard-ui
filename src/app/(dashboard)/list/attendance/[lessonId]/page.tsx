import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import AttendanceForm from "./attendance-form";

const AttendanceLessonPage = async ({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) => {
  const resolvedParams = await params;

  // console.log("PARAMS RAW:", resolvedParams);
  // console.log("LESSON ID:", resolvedParams.lessonId);

  const lessonId = Number(resolvedParams.lessonId);

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (Number.isNaN(lessonId)) {
    return <div>Lesson ID không hợp lệ</div>;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      class: {
        include: {
          students: {
            orderBy: { name: "asc" },
          },
        },
      },
      attendances: {
        where: {
          date: today,
        },
      },
    },
  });

  if (!lesson) {
    return <div className="p-6">Không tìm thấy tiết học</div>;
  }

  if (role === "teacher" && lesson.teacherId !== userId) {
    return <div className="p-6">Bạn không có quyền điểm danh tiết này</div>;
  }

  return (
    <AttendanceForm
      lesson={lesson}
      initialAttendances={lesson.attendances}
      date={today}
    />
  );
};

export default AttendanceLessonPage;
