"use client";

type Props = {
  students: { id: string; name: string; surname: string }[];
  attendances: any[];
};

const ParentAttendanceList = ({ students, attendances }: Props) => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Tình trạng đi học của con</h1>

      {students.map((student) => (
        <div key={student.id} className="space-y-2">
          <h2 className="font-medium text-lamaYellow">
            {student.surname + " " + student.name}
          </h2>

          {attendances
            .filter((a) => a.studentId === student.id)
            .map((a) => (
              <AttendanceCard key={a.id} attendance={a} />
            ))}
        </div>
      ))}
    </div>
  );
};

export default ParentAttendanceList;

const AttendanceCard = ({ attendance }: { attendance: any }) => {
  const { lesson, present } = attendance;

  const status =
    present === true
      ? { text: "Có mặt", color: "text-[#6FC28D]" }
      : present === false
      ? { text: "Vắng mặt", color: "text-[#F05A7E]" }
      : { text: "Chưa điểm danh", color: "text-yellow-500" };

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <p className="font-medium text-sm">{lesson.subject.name}</p>
          <p className="text-xs text-gray-500">{lesson.class.name}</p>
          <p className="text-xs">
            {lesson.startTime.toLocaleDateString("vi-VN")} –{" "}
            {lesson.startTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <span className={`text-sm font-semibold ${status.color}`}>
          {status.text}
        </span>
      </div>
    </div>
  );
};
