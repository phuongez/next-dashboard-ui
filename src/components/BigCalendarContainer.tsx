import { prisma } from "@/lib/prisma";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  const getClassName = async (id: number) => {
    const classInfo = await prisma.class.findUnique({
      where: {
        id: id,
      },
    });
    return classInfo?.name;
  };

  const classNames = await Promise.all(
    dataRes.map((lesson) => getClassName(lesson.classId))
  );

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    classId: lesson.classId,
    class: classNames,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

  return (
    <div className="h-full">
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;
