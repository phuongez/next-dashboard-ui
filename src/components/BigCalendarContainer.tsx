import { prisma } from "@/lib/prisma";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const lessons = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
    include: {
      class: true,
      subject: true,
    },
  });

  const data = lessons.map((lesson) => ({
    start: lesson.startTime,
    end: lesson.endTime,
    subject: lesson.subject,
    class: lesson.class,
  }));

  return (
    <div className="h-[90%]">
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;

// import { prisma } from "@/lib/prisma";
// import { adjustScheduleToCurrentWeek } from "@/lib/utils";
// import BigCalendar from "./BigCalendar";

// const BigCalendarContainer = async ({
//   type,
//   id,
// }: {
//   type: "teacherId" | "classId";
//   id: string | number;
// }) => {
//   const dataRes = await prisma.lesson.findMany({
//     where: {
//       ...(type === "teacherId"
//         ? { teacherId: id as string }
//         : { classId: id as number }),
//     },
//   });

//   const getClassName = async (id: number) => {
//     const classInfo = await prisma.class.findUnique({
//       where: {
//         id: id,
//       },
//     });
//     return classInfo?.name;
//   };

//   const classNames = await Promise.all(
//     dataRes.map((lesson) => getClassName(lesson.classId))
//   );

//   const data = dataRes.map((lesson) => ({
//     title: lesson.name,
//     classId: lesson.classId,
//     class: classNames,
//     start: lesson.startTime,
//     end: lesson.endTime,
//   }));

//   return (
//     <div className="h-[90%]">
//       <BigCalendar data={data} />
//     </div>
//   );
// };

// export default BigCalendarContainer;
