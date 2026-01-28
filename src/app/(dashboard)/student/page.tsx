import Announcements from "@/components/Annoucement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  const studentData = await prisma.student.findUnique({
    where: {
      id: userId!,
    },
    include: {
      class: true,
    },
  });

  console.log(classItem);
  return (
    <div className="px-4 flex gap-4 flex-col xl:flex-row h-screen">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            📆 Lịch học ({studentData?.class.name})
          </h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* <div className="bg-white p-4 rounded-md">
          <EventCalendar />
        </div> */}
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
