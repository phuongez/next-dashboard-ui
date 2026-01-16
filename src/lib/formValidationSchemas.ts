import { start } from "repl";
import { z } from "zod";

/* ================= SUBJECT ================= */

export const subjectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Subject name is required!"),
  teachers: z.array(z.string()),
});

export const subjectSchema = subjectFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,
  name: v.name,
  teachers: v.teachers,
}));

export type SubjectSchema = z.infer<typeof subjectSchema>;

/* ================= CLASS ================= */

export const classFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Class name is required!"),
  capacity: z.string().min(1, "Capacity is required!"),
  gradeId: z.string().min(1, "Grade is required!"),
  supervisorId: z.string().optional(),
});

export const classSchema = classFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,
  name: v.name,
  capacity: Number(v.capacity),
  gradeId: Number(v.gradeId),
  supervisorId: v.supervisorId || null,
}));

export type ClassSchema = z.infer<typeof classSchema>;

/* ================= TEACHER ================= */

export const teacherFormSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3).max(20),
  password: z.string().optional(),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE"]),
  subjects: z.array(z.string()).optional(),
});

export const teacherSchema = teacherFormSchema.transform((v) => ({
  ...v,
  birthday: new Date(v.birthday),
}));

export type TeacherSchema = z.infer<typeof teacherSchema>;

/* ================= STUDENT ================= */

export const studentFormSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3).max(20),
  password: z.string().optional(),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE"]),
  gradeId: z.string().min(1),
  classId: z.string().min(1),
  parentId: z.string().min(1),
});

export const studentSchema = studentFormSchema.transform((v) => ({
  ...v,
  birthday: new Date(v.birthday),
  gradeId: Number(v.gradeId),
  classId: Number(v.classId),
}));

export type StudentSchema = z.infer<typeof studentSchema>;

/* ================= EXAM ================= */

export const examFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  lessonId: z.string().min(1),
});

export const examSchema = examFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,
  title: v.title,
  startTime: new Date(v.startTime),
  endTime: new Date(v.endTime),
  lessonId: Number(v.lessonId),
}));

export type ExamSchema = z.infer<typeof examSchema>;

/* ================= LESSON ================= */

export const lessonFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  teacherId: z.string().min(1),
});

export const lessonSchema = lessonFormSchema.transform((v) => ({
  ...v,
  subjectId: Number(v.subjectId),
  classId: Number(v.classId),
}));

export type LessonSchema = z.infer<typeof lessonSchema>;

/* ================= PARENT ================= */

export const parentFormSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  address: z.string().min(1),
  students: z.array(z.string()).optional(),
});

export const parentSchema = parentFormSchema.transform((v) => ({
  ...v,
  id: v.id ? Number(v.id) : undefined,
}));

export type ParentSchema = z.infer<typeof parentSchema>;

/* ================= EVENT ================= */

export const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  classId: z.string().optional(),
});

export const eventSchema = eventFormSchema.transform((v) => ({
  ...v,
  id: v.id ? Number(v.id) : undefined,
  classId: v.classId ? Number(v.classId) : null,
}));

export type EventSchema = z.infer<typeof eventSchema>;

/* ================= RESULT ================= */

export const resultFormSchema = z
  .object({
    id: z.string().optional(),
    score: z.string(),
    studentId: z.string().min(1),
    examId: z.string().optional(),
    assignmentId: z.string().optional(),
  })
  .refine((v) => v.examId || v.assignmentId, {
    message: "Result must belong to exam or assignment",
    path: ["examId"],
  });

export const resultSchema = resultFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,
  score: Number(v.score),
  studentId: v.studentId,
  examId: v.examId ? Number(v.examId) : undefined,
  assignmentId: v.assignmentId ? Number(v.assignmentId) : undefined,
}));

export type ResultSchema = z.infer<typeof resultSchema>;

/* ================= ANNOUNCEMENT ================= */

export const announcementFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  classId: z.string().optional(),
});

export const announcementSchema = announcementFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,
  title: v.title,
  description: v.description,
  date: v.date,
  classId: v.classId ? Number(v.classId) : null,
}));

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const assignmentFormSchema = z.object({
  id: z.string().optional(),

  title: z.string().min(1, "Title is required"),

  // input type="date" hoặc datetime-local → string
  startDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),

  lessonId: z.string().min(1, "Lesson is required"),
});

export const assignmentSchema = assignmentFormSchema.transform((v) => ({
  id: v.id ? Number(v.id) : undefined,

  title: v.title,

  startDate: new Date(v.startDate),
  dueDate: new Date(v.dueDate),

  lessonId: Number(v.lessonId),
}));

// export const subjectSchema = z.object({
//   id: z.coerce.number().optional(),
//   name: z.string().min(1, { message: "Subject name is required!" }),
//   teachers: z.array(z.string()), //teacher ids
// });

// export type SubjectSchema = z.infer<typeof subjectSchema>;

// export const classSchema = z.object({
//   id: z.coerce.number().optional(),
//   name: z.string().min(1, { message: "Subject name is required!" }),
//   capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
//   gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
//   supervisorId: z.coerce.string().optional(),
// });

// export type ClassSchema = z.infer<typeof classSchema>;

// export const teacherSchema = z.object({
//   id: z.string().optional(),
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters long!" })
//     .max(20, { message: "Username must be at most 20 characters long!" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long!" })
//     .optional()
//     .or(z.literal("")),
//   name: z.string().min(1, { message: "First name is required!" }),
//   surname: z.string().min(1, { message: "Last name is required!" }),
//   email: z
//     .string()
//     .email({ message: "Invalid email address!" })
//     .optional()
//     .or(z.literal("")),
//   phone: z.string().optional(),
//   address: z.string(),
//   img: z.string().optional(),
//   bloodType: z.string().min(1, { message: "Blood Type is required!" }),
//   birthday: z.coerce.date({ message: "Birthday is required!" }),
//   sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
//   subjects: z.array(z.string()).optional(), // subject ids
// });

// export type TeacherSchema = z.infer<typeof teacherSchema>;

// export const studentSchema = z.object({
//   id: z.string().optional(),
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters long!" })
//     .max(20, { message: "Username must be at most 20 characters long!" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long!" })
//     .optional()
//     .or(z.literal("")),
//   name: z.string().min(1, { message: "First name is required!" }),
//   surname: z.string().min(1, { message: "Last name is required!" }),
//   email: z
//     .string()
//     .email({ message: "Invalid email address!" })
//     .optional()
//     .or(z.literal("")),
//   phone: z.string().optional(),
//   address: z.string(),
//   img: z.string().optional(),
//   bloodType: z.string().min(1, { message: "Blood Type is required!" }),
//   birthday: z.coerce.date({ message: "Birthday is required!" }),
//   sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
//   gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
//   classId: z.coerce.number().min(1, { message: "Class is required!" }),
//   parentId: z.string().min(1, { message: "Parent Id is required!" }),
// });

// export type StudentSchema = z.infer<typeof studentSchema>;

// export const examSchema = z.object({
//   id: z.coerce.number().optional(),
//   title: z.string().min(1, { message: "Title name is required!" }),
//   startTime: z.coerce.date({ message: "Start time is required!" }),
//   endTime: z.coerce.date({ message: "End time is required!" }),
//   lessonId: z.coerce.number({ message: "Lesson is required!" }),
// });

// export type ExamSchema = z.infer<typeof examSchema>;

// export const lessonSchema = z.object({
//   id: z.coerce.number().optional(),
//   name: z.string().min(1, { message: "Title name is required!" }),
//   day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
//     message: "Day is required!",
//   }),

//   startTime: z.string().min(1, { message: "Start time is required!" }),
//   endTime: z.string().min(1, { message: "End time is required!" }),
//   subjectId: z.coerce.number({ message: "Subject is required!" }),
//   classId: z.coerce.number({ message: "Class is required!" }),
//   teacherId: z.string().min(1, { message: "Teacher Id is required!" }),
// });

// export type LessonSchema = z.infer<typeof examSchema>;

// export const parentSchema = z.object({
//   id: z.coerce.number().optional(),
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(6, "Password is required"),
//   name: z.string().min(1, "Name is required"),
//   surname: z.string().min(1, "Surname is required"),
//   email: z.string().email().optional().or(z.literal("")),
//   phone: z.string().min(1, "Phone is required"),
//   address: z.string().min(1, "Address is required"),
//   students: z.array(z.string()).optional(),
// });

// export type ParentSchema = z.infer<typeof parentSchema>;

// export const eventSchema = z.object({
//   id: z.coerce.number().optional(),

//   title: z.string().min(1, "Title is required"),
//   description: z.string().min(1, "Description is required"),

//   startTime: z.string().min(1, "Start time is required"),
//   endTime: z.string().min(1, "End time is required"),

//   classId: z.coerce.number().optional(),
// });

// export type EventSchema = z.infer<typeof eventSchema>;

// export const resultSchema = z
//   .object({
//     id: z.coerce.number().optional(),

//     score: z.coerce.number().min(0, "Score >= 0").max(10, "Score <= 10"),

//     studentId: z.string().min(1, "Student is required"),

//     examId: z.coerce.number().optional(),
//     assignmentId: z.coerce.number().optional(),
//   })
//   .refine((data) => data.examId || data.assignmentId, {
//     message: "Result must belong to exam or assignment",
//     path: ["examId"],
//   });

// export type ResultSchema = z.infer<typeof resultSchema>;

// // export const announcementSchema = z.object({
// //   id: z.coerce.number<string>(),

// //   title: z.string().min(1, "Title is required"),
// //   description: z.string().min(1, "Description is required"),

// //   date: z.string().min(1, "Date is required"),

// //   classId: z.coerce.number<string>().optional(),
// // });

// export const announcementFormSchema = z.object({
//   id: z.string().optional(),
//   title: z.string().min(1),
//   description: z.string().min(1),
//   date: z.string().min(1),
//   classId: z.string().optional(),
// });

// export const announcementSchema = announcementFormSchema.transform((v) => ({
//   ...v,
//   id: v.id ? Number(v.id) : undefined,
//   classId: v.classId ? Number(v.classId) : null,
// }));

// export type AnnouncementSchema = z.infer<typeof announcementSchema>;
