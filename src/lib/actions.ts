"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  LessonSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import { prisma } from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };
const client = await clerkClient();

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await client.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log("CLERK ERROR:", err.errors);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await client.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (prevState: any, formData: FormData) => {
  try {
    await prisma.lesson.create({
      data: {
        name: formData.get("name") as string,
        day: formData.get("day") as any,
        startTime: new Date(formData.get("startTime") as string),
        endTime: new Date(formData.get("endTime") as string),
        subjectId: Number(formData.get("subjectId")),
        classId: Number(formData.get("classId")),
        teacherId: formData.get("teacherId") as string,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: true };
  }
};

export const updateLesson = async (prevState: any, formData: FormData) => {
  try {
    await prisma.lesson.update({
      where: {
        id: Number(formData.get("id")),
      },
      data: {
        name: formData.get("name") as string,
        day: formData.get("day") as any,
        startTime: new Date(formData.get("startTime") as string),
        endTime: new Date(formData.get("endTime") as string),
        subjectId: Number(formData.get("subjectId")),
        classId: Number(formData.get("classId")),
        teacherId: formData.get("teacherId") as string,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const deleteLesson = async (formData: FormData) => {
  try {
    await prisma.lesson.delete({
      where: {
        id: Number(formData.get("id")),
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const createParent = async (prev: any, data: any) => {
  try {
    // 1️⃣ Tạo user trên Clerk
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    // 2️⃣ Tạo Parent trong DB
    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: data.students?.length
          ? {
              connect: data.students.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: true };
  }
};

export const updateParent = async (prev: any, data: any) => {
  try {
    const { id, students, password, ...rest } = data;

    /* ================= 1️⃣ UPDATE CLERK ================= */

    const clerkUpdateData: any = {
      username: rest.username,
      firstName: rest.name,
      lastName: rest.surname,
    };

    // chỉ update password nếu có nhập mới
    if (password && password.length > 0) {
      clerkUpdateData.password = password;
    }

    await client.users.updateUser(id, clerkUpdateData);

    /* ================= 2️⃣ UPDATE PRISMA ================= */

    await prisma.parent.update({
      where: { id },
      data: {
        username: rest.username,
        name: rest.name,
        surname: rest.surname,
        email: rest.email || null,
        phone: rest.phone,
        address: rest.address,

        students: students
          ? {
              set: students.map((sid: string) => ({ id: sid })),
            }
          : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: true };
  }
};

export const deleteParent = async (formData: FormData) => {
  const id = formData.get("id") as string;

  try {
    await prisma.parent.delete({ where: { id } });
    await client.users.deleteUser(id);
    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const createEvent = async (prev: any, data: any) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId || null,
      },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
};

export const updateEvent = async (prev: any, data: any) => {
  try {
    const { id, ...rest } = data;

    await prisma.event.update({
      where: { id },
      data: {
        title: rest.title,
        description: rest.description,
        startTime: new Date(rest.startTime),
        endTime: new Date(rest.endTime),
        classId: rest.classId || null,
      },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (formData: FormData) => {
  try {
    await prisma.event.delete({
      where: {
        id: Number(formData.get("id")),
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const createResult = async (prev: any, data: any) => {
  const lesson = data.examId
    ? await prisma.exam.findUnique({
        where: { id: data.examId },
        select: {
          lesson: {
            select: {
              class: {
                select: { students: { select: { id: true } } },
              },
            },
          },
        },
      })
    : await prisma.assignment.findUnique({
        where: { id: data.assignmentId },
        select: {
          lesson: {
            select: {
              class: {
                select: { students: { select: { id: true } } },
              },
            },
          },
        },
      });

  const validStudentIds = lesson?.lesson.class.students.map((s) => s.id) ?? [];

  if (!validStudentIds.includes(data.studentId)) {
    throw new Error("Student does not belong to this class");
  }
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const updateResult = async (prev: any, data: any) => {
  try {
    const { id, ...rest } = data;

    await prisma.result.update({
      where: { id },
      data: {
        score: rest.score,
        studentId: rest.studentId,
        examId: rest.examId || null,
        assignmentId: rest.assignmentId || null,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const deleteResult = async (formData: FormData) => {
  try {
    await prisma.result.delete({
      where: { id: Number(formData.get("id")) },
    });
    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const getStudentsByAssessment = async (
  type: "exam" | "assignment",
  id: number
) => {
  if (type === "exam") {
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: {
        lesson: {
          select: {
            class: {
              select: {
                students: {
                  select: {
                    id: true,
                    name: true,
                    surname: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return exam?.lesson.class.students ?? [];
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    select: {
      lesson: {
        select: {
          class: {
            select: {
              students: {
                select: {
                  id: true,
                  name: true,
                  surname: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return assignment?.lesson.class.students ?? [];
};

export const createAnnouncement = async (prev: any, data: any) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (prev: any, data: any) => {
  try {
    const { id, ...rest } = data;

    await prisma.announcement.update({
      where: { id },
      data: {
        title: rest.title,
        description: rest.description,
        date: new Date(rest.date),
        classId: rest.classId || null,
      },
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (formData: FormData) => {
  try {
    await prisma.announcement.delete({
      where: { id: Number(formData.get("id")) },
    });
    return { success: true };
  } catch {
    return { success: false, error: true };
  }
};

export const sendMessage = async (conversationId: number, content: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (
    !conversation ||
    (conversation.teacherId !== userId && conversation.parentId !== userId)
  ) {
    throw new Error("Forbidden");
  }

  await prisma.message.create({
    data: {
      content,
      senderId: userId,
      conversationId,
    },
  });

  // Cập nhật updatedAt để inbox sort đúng
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {},
  });
};

export const markConversationAsRead = async (
  conversationId: number,
  userId: string
) => {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
};

export const getOrCreateConversation = async ({
  teacherId,
  parentId,
  studentId,
}: {
  teacherId: string | null;
  parentId: string;
  studentId: string;
}) => {
  if (!teacherId) {
    return null;
  }
  let conversation = await prisma.conversation.findFirst({
    where: { teacherId, parentId, studentId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { teacherId, parentId, studentId },
    });
  }

  return conversation.id;
};
