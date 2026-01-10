"use server";

import { prisma } from "../prisma";

export async function submitAttendance(
  lessonId: number,
  date: Date,
  records: { studentId: string; present: boolean }[]
) {
  for (const r of records) {
    await prisma.attendance.upsert({
      where: {
        studentId_lessonId_date: {
          studentId: r.studentId,
          lessonId,
          date,
        },
      },
      update: {
        present: r.present,
      },
      create: {
        studentId: r.studentId,
        lessonId,
        date,
        present: r.present,
      },
    });
  }
}
