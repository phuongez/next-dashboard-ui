import { prisma } from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { StudentScalarFieldEnum } from "@/generated/prisma/internal/prismaNamespace";
import { Prisma } from "@/generated/prisma/client";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: string | number;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });

        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
        };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: {
            id: true,
            name: true,
            class: true,
            subject: true,
          },
        });
        relatedData = { lessons: examLessons };
        break;
      case "lesson":
        const subjects = await prisma.subject.findMany({
          include: {
            teachers: {
              select: { id: true, name: true, surname: true },
            },
          },
        });

        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });

        relatedData = { subjects, classes };
        break;
      case "parent":
        let whereCondition: any = {
          parentId: null,
        };

        if (type === "update" && id) {
          whereCondition = {
            OR: [
              { parentId: null },
              { parentId: id }, // ✅ dùng id prop, KHÔNG dùng data.id
            ],
          };
        }

        const students = await prisma.student.findMany({
          where: whereCondition,
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        relatedData = { students };
        break;
      case "event":
        const classesData = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classesData };
        break;
      case "result": {
        const userId = currentUserId;

        const studentsData = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });

        let examWhere: Prisma.ExamWhereInput | undefined = undefined;
        let assignmentWhere: Prisma.AssignmentWhereInput | undefined =
          undefined;

        if (role === "teacher" && userId) {
          examWhere = {
            lesson: {
              teacherId: userId,
            },
          };

          assignmentWhere = {
            lesson: {
              teacherId: userId,
            },
          };
        }

        const exams = await prisma.exam.findMany({
          where: examWhere,
          select: {
            id: true,
            title: true,
            startTime: true,
            lesson: { select: { class: true } },
          },
        });

        const assignments = await prisma.assignment.findMany({
          where: assignmentWhere,
          select: {
            id: true,
            title: true,
            startDate: true,
            lesson: { select: { class: true } },
          },
        });

        relatedData = { studentsData, exams, assignments };
        break;
      }

      case "announcement":
        const classesAnnouncement = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classesAnnouncement };
        break;

      case "assignment": {
        const userId = currentUserId;

        let lessonWhere: Prisma.LessonWhereInput | undefined = undefined;

        if (role === "teacher" && userId) {
          lessonWhere = {
            teacherId: userId,
          };
        }

        const lessons = await prisma.lesson.findMany({
          where: lessonWhere,
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            subject: { select: { name: true } },
          },
        });

        relatedData = { lessons };
        break;
      }

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
