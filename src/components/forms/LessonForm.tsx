"use client";

import { lessonFormSchema } from "@/lib/formValidationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { startTransition, useActionState, useEffect } from "react";
import { createLesson, updateLesson } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import z from "zod";

type LessonFormInput = z.infer<typeof lessonFormSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: {
    subjects: {
      id: number;
      name: string;
      teachers: {
        id: string;
        name: string;
        surname: string;
      }[];
    }[];
    classes: {
      id: number;
      name: string;
    }[];
  };
};

const dayMap = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const LessonForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormInput>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: data,
  });

  const selectedSubjectId = watch("subjectId");

  const teachers =
    relatedData?.subjects.find((s) => s.id === Number(selectedSubjectId))
      ?.teachers ?? [];

  const action = type === "create" ? createLesson : updateLesson;

  const [state, formAction] = useActionState(action, {
    success: false,
    error: false,
  });

  /* ================= AUTO SET DAY ================= */

  const handleStartTimeChange = (value: string) => {
    const date = new Date(value);
    const day = dayMap[date.getDay()];
    setValue("day", day as any);
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        type === "create" ? "Đã tạo tiết học" : "Đã cập nhật tiết học",
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((formData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      fd.append(key, String(value));
    });

    if (type === "update") {
      fd.append("id", String(data.id));
    }
    startTransition(() => {
      formAction(fd);
    });
  });

  /* ================= UI ================= */

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">
        {type === "create" ? "Thêm tiết học" : "Cập nhật tiết học"}
      </h1>
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Tên tiết học</label>
          <input
            {...register("name")}
            placeholder="Tên tiết học"
            className="border p-2 rounded-md"
          />

          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            {...register("startTime")}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="border p-2 rounded-md"
          />
          {errors.startTime && (
            <span className="text-red-500">{errors.startTime.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            {...register("endTime")}
            className="border p-2 rounded-md"
          />
          {errors.endTime && (
            <span className="text-red-500">{errors.endTime.message}</span>
          )}
        </div>

        {/* hidden day – auto calculated */}
        <input type="hidden" {...register("day")} />
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Môn học</label>
          <select {...register("subjectId")} className="border p-2 rounded-md">
            <option value="">Chọn môn học</option>
            {relatedData?.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Lớp học</label>
          <select {...register("classId")} className="border p-2 rounded-md">
            <option value="">Chọn lớp</option>
            {relatedData?.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Giáo viên</label>
          <select {...register("teacherId")} className="border p-2 rounded-md">
            <option value="">Chọn giáo viên</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.surname} {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-lamaYellow text-white text-sm font-medium px-4 py-2 rounded-md self-end"
      >
        {type === "create" ? "Tạo mới" : "Cập nhật"}
      </button>
    </form>
  );
};

export default LessonForm;
