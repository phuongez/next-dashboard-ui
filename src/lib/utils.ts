import { prisma } from "./prisma";

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

const getClassName = async (id: string) => {
  const classInfo = await prisma.class.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  return classInfo?.name;
};

export const adjustScheduleToCurrentWeek = async (
  lessons: {
    title: string;
    classId: number;
    start: Date;
    end: Date;
  }[]
): Promise<
  {
    title: string;
    className?: string;
    start: Date;
    end: Date;
  }[]
> => {
  const latestMonday = getLatestMonday();

  return Promise.all(
    lessons.map(async (lesson) => {
      const lessonDayOfWeek = lesson.start.getDay();
      const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

      const adjustedStartDate = new Date(latestMonday);
      adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
      adjustedStartDate.setHours(
        lesson.start.getHours(),
        lesson.start.getMinutes(),
        lesson.start.getSeconds()
      );

      const adjustedEndDate = new Date(adjustedStartDate);
      adjustedEndDate.setHours(
        lesson.end.getHours(),
        lesson.end.getMinutes(),
        lesson.end.getSeconds()
      );

      const className = await getClassName(lesson.classId.toString());

      return {
        title: lesson.title,
        classId: lesson.classId,
        className,
        start: adjustedStartDate,
        end: adjustedEndDate,
      };
    })
  );
};
