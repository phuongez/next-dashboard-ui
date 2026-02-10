"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examFormSchema, examSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import z from "zod";
import { format } from "date-fns";

type ExamFormInput = z.infer<typeof examFormSchema>;

type Lesson = {
  id: number;
  startTime: string;
  endTime: string;
  name: string;
  class: { name: string };
  subject: { name: string };
};

const toDate = (value?: string | Date | number | null): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "number") return new Date(value);

  if (typeof value === "string") {
    // Safari không parse "yyyy-MM-dd HH:mm:ss"
    const safe = value.includes("T") ? value : value.replace(" ", "T");
    const d = new Date(safe);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const toDatetimeLocal = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  return format(d, "yyyy-MM-dd'T'HH:mm");
};

const toDisplayDatetime = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  return format(d, "HH:mm dd/MM/yyyy");
};

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: { lessons: Lesson[] };
}) => {
  const { lessons } = relatedData;

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormInput>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: data?.title ?? "",
      lessonId: data?.lessonId ?? undefined,
      startTime: data?.startTime ?? "",
      endTime: data?.endTime ?? "",
      id: data?.id,
    },
  });

  const rawLessonId = watch("lessonId") ?? data?.lessonId;
  const lessonId = rawLessonId ? Number(rawLessonId) : null;

  useEffect(() => {
    if (!lessonId) return;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    setSelectedLesson(lesson);
    console.log(selectedLesson);

    setValue("startTime", toDatetimeLocal(lesson.startTime));
    setValue("endTime", toDatetimeLocal(lesson.endTime));
  }, [lessonId, lessons, setValue]);

  const [state, formAction] = useActionState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false },
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Bài kiểm tra đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    const parsed = examSchema.parse(formData);
    startTransition(() => {
      formAction(parsed);
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo bài kiểm tra mới" : "Cập nhật bài kiểm tra"}
      </h1>

      <div className="flex flex-wrap gap-4">
        {/* Tên bài kiểm tra */}
        <InputField
          label="Tên bài kiểm tra"
          name="title"
          register={register}
          error={errors?.title}
        />

        {/* Lesson select */}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Tiết học</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
          >
            <option value="">-- Chọn tiết học --</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.class.name} - {lesson.subject.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        {/* Hiển thị thời gian đã xác định */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">
            Thời gian bài kiểm tra
          </label>
          <div className="ring-[1.5px] ring-gray-300 bg-gray-100 p-2 rounded-md text-sm">
            {selectedLesson ? (
              <>
                {toDisplayDatetime(selectedLesson.startTime)} –{" "}
                {toDisplayDatetime(selectedLesson.endTime)}
              </>
            ) : (
              <span className="text-gray-400">
                Chọn tiết học để xác định thời gian
              </span>
            )}
          </div>
        </div>

        {/* Hidden fields */}
        <input type="hidden" {...register("startTime")} />
        <input type="hidden" {...register("endTime")} />

        {data && <input type="hidden" {...register("id")} />}
      </div>

      {state.error && <span className="text-red-500">Đã có lỗi xảy ra!</span>}

      <button className="bg-lamaYellow text-white p-2 rounded-md">
        {type === "create" ? "Tạo mới" : "Cập nhật"}
      </button>
    </form>
  );
};

export default ExamForm;

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import InputField from "../InputField";
// import { examFormSchema, examSchema } from "@/lib/formValidationSchemas";
// import { createExam, updateExam } from "@/lib/actions";
// import {
//   Dispatch,
//   SetStateAction,
//   startTransition,
//   useActionState,
//   useEffect,
//   useState,
// } from "react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";
// import z from "zod";
// import { format } from "date-fns";

// type ExamFormInput = z.infer<typeof examFormSchema>;

// type Lesson = {
//   id: number;
//   startTime: string;
//   endTime: string;
//   name?: string;
// };

// const ExamForm = ({
//   type,
//   data,
//   setOpen,
//   relatedData,
// }: {
//   type: "create" | "update";
//   data?: any;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   relatedData?: any;
// }) => {
//   const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<ExamFormInput>({
//     resolver: zodResolver(examFormSchema),
//   });

//   // AFTER REACT 19 IT'LL BE USEACTIONSTATE

//   const [state, formAction] = useActionState(
//     type === "create" ? createExam : updateExam,
//     {
//       success: false,
//       error: false,
//     }
//   );

//   const onSubmit = handleSubmit((data) => {
//     const parsed = examSchema.parse(data);
//     startTransition(() => {
//       formAction(parsed);
//     });
//   });

//   const router = useRouter();

//   useEffect(() => {
//     if (state.success) {
//       toast(`Bài kiểm tra đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
//       setOpen(false);
//       router.refresh();
//     }
//   }, [state, router, type, setOpen]);

//   const { lessons } = relatedData;

//   const lessonId = Number(watch("lessonId"));

//   useEffect(() => {
//     if (!lessonId) return;

//     const lesson = lessons.find((l: Lesson) => l.id === lessonId);
//     if (!lesson) return;

//     setSelectedLesson(lesson);

//     const start = toDatetimeLocal(lesson.startTime);
//     const end = toDatetimeLocal(lesson.endTime);

//     if (start) {
//       setValue("startTime", start, { shouldDirty: true });
//     }

//     if (end) {
//       setValue("endTime", end, { shouldDirty: true });
//     }
//   }, [lessonId, lessons, setValue]);

//   return (
//     <form className="flex flex-col gap-8" onSubmit={onSubmit}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Tạo bài kiểm tra mới" : "Cập nhật bài kiểm tra"}
//       </h1>

//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Tên bài kiểm tra"
//           name="title"
//           defaultValue={data?.title}
//           register={register}
//           error={errors?.title}
//         />
//         <InputField
//           label="Thời gian bắt đầu"
//           name="startTime"
//           register={register}
//           error={errors?.startTime}
//           type="datetime-local"
//           inputProps={{ readOnly: true }}
//         />

//         <InputField
//           label="Thời gian kết thúc"
//           name="endTime"
//           register={register}
//           error={errors?.endTime}
//           type="datetime-local"
//           inputProps={{ readOnly: true }}
//         />

//         {/* <InputField
//           label="Thời gian bắt đầu"
//           name="startTime"
//           defaultValue={data?.startTime}
//           register={register}
//           error={errors?.startTime}
//           type="datetime-local"
//         />
//         <InputField
//           label="Thời gian kết thúc"
//           name="endTime"
//           defaultValue={data?.endTime}
//           register={register}
//           error={errors?.endTime}
//           type="datetime-local"
//         /> */}
//         {data && (
//           <InputField
//             label="Id"
//             name="id"
//             defaultValue={data?.id}
//             register={register}
//             error={errors?.id}
//             hidden
//           />
//         )}
//         <div className="flex flex-col gap-2 w-full md:w-1/3">
//           <label className="text-xs text-gray-500">Tiết học</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("lessonId")}
//             defaultValue={
//               lessons.find(
//                 (lesson: {
//                   id: number;
//                   name: string;
//                   class: any;
//                   subject: any;
//                 }) => {
//                   return lesson.id === data?.lessonId;
//                 }
//               )?.id ?? ""
//             }
//           >
//             {lessons.map(
//               (lesson: {
//                 id: number;
//                 name: string;
//                 class: any;
//                 subject: any;
//               }) => (
//                 <option value={lesson.id} key={lesson.id}>
//                   {lesson.name +
//                     " - " +
//                     lesson.class.name +
//                     " - " +
//                     lesson.subject.name}
//                 </option>
//               )
//             )}
//           </select>
//           {errors.lessonId?.message && (
//             <p className="text-xs text-red-400">
//               {errors.lessonId.message.toString()}
//             </p>
//           )}
//         </div>
//       </div>
//       {state.error && <span className="text-red-500">Đã có lỗi!</span>}
//       <button className="bg-lamaYellow text-white p-2 rounded-md">
//         {type === "create" ? "Tạo mới" : "Cập nhật"}
//       </button>
//     </form>
//   );
// };

// export default ExamForm;

// const toDatetimeLocal = (value?: string) => {
//   if (!value) return "";

//   const d = new Date(value);
//   if (isNaN(d.getTime())) return "";

//   return format(d, "yyyy-MM-dd'T'HH:mm");
// };
