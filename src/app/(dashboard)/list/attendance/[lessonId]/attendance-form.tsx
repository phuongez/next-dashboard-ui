"use client";

import { Attendance, Class, Lesson, Student } from "@/generated/prisma/client";
import { submitAttendance } from "@/lib/actions/attendance";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type LessonWithData = Lesson & {
  class: Class & { students: Student[] };
};

type Props = {
  lesson: LessonWithData;
  initialAttendances: Attendance[];
  date: Date;
};

const AttendanceForm = ({ lesson, initialAttendances, date }: Props) => {
  const router = useRouter();

  const attendanceMap = new Map(
    initialAttendances.map((a) => [a.studentId, a.present])
  );

  const [records, setRecords] = useState(
    lesson.class.students.map((s) => ({
      studentId: s.id,
      name: `${s.name} ${s.surname}`,
      present: attendanceMap.get(s.id) ?? true,
    }))
  );

  const toggle = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, present: !r.present } : r
      )
    );
  };

  const onSubmit = async () => {
    try {
      await submitAttendance(
        lesson.id,
        date,
        records.map(({ studentId, present }) => ({
          studentId,
          present,
        }))
      );

      toast.success("Đã lưu điểm danh");
      router.push("/list/attendance");
      router.refresh();
    } catch (e) {
      toast.error("Lỗi khi lưu điểm danh");
    }
  };

  return (
    <div className="bg-white p-6 rounded-md m-4">
      <h1 className="text-lg font-semibold mb-2">Điểm danh – {lesson.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Lớp: {lesson.class.name} · {date.toLocaleDateString("vi-VN")}
      </p>

      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100 text-sm">
            <th className="p-3 text-left">Học sinh</th>
            <th className="p-3 text-center">Có mặt</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.studentId} className="border-b hover:bg-slate-50">
              <td className="p-3">{r.name}</td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={r.present}
                  onChange={() => toggle(r.studentId)}
                  className="w-5 h-5"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <button
          onClick={onSubmit}
          className="bg-lamaSky px-6 py-2 rounded-md text-sm font-medium"
        >
          Lưu điểm danh
        </button>
      </div>
    </div>
  );
};

export default AttendanceForm;
