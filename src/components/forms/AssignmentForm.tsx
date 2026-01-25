"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  assignmentFormSchema,
  assignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import InputField from "../InputField";

type AssignmentSchema = z.infer<typeof assignmentSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    lessons?: {
      id: number;
      name: string;
      subject: { name: string };
      class: { name: string };
    }[];
  };
};

const AssignmentForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues:
      type === "update"
        ? {
            ...data,
            startDate: data?.startDate
              ? new Date(data.startDate).toISOString().slice(0, 16)
              : undefined,
            dueDate: data?.dueDate
              ? new Date(data.dueDate).toISOString().slice(0, 16)
              : undefined,
          }
        : undefined,
  });

  const onSubmit = handleSubmit(async (formData) => {
    const action = type === "create" ? createAssignment : updateAssignment;

    const res = await action(null, formData);

    if (res?.success) {
      toast(`Bài tập đã được ${type === "create" ? "tạo" : "cập nhật"}`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Có lỗi xảy ra");
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo bài tập" : "Cập nhật bài tập"}
      </h1>

      {/* ===== TITLE ===== */}
      <InputField
        label="Tiêu đề"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors.title}
      />

      {/* ===== START DATE ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Thời gian bắt đầu</label>
        <input
          type="datetime-local"
          {...register("startDate")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        />
        {errors.startDate && (
          <p className="text-xs text-red-400">{errors.startDate.message}</p>
        )}
      </div>

      {/* ===== DUE DATE ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Thời hạn nộp</label>
        <input
          type="datetime-local"
          {...register("dueDate")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        />
        {errors.dueDate && (
          <p className="text-xs text-red-400">{errors.dueDate.message}</p>
        )}
      </div>

      {/* ===== LESSON ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Tiết học</label>
        <select
          {...register("lessonId")}
          defaultValue={data?.lessonId ?? ""}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        >
          <option value="">Chọn tiết học</option>
          {relatedData?.lessons?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.subject.name} – {l.class.name} – {l.name}
            </option>
          ))}
        </select>
        {errors.lessonId && (
          <p className="text-xs text-red-400">{errors.lessonId.message}</p>
        )}
      </div>

      {/* ===== ID (UPDATE) ===== */}
      {type === "update" && (
        <input type="hidden" {...register("id")} value={data?.id} />
      )}

      {/* {state.error && (
        <span className="text-red-500 text-sm">
          Có lỗi xảy ra, vui lòng thử lại!
        </span>
      )} */}

      <button className="bg-lamaYellow text-white py-2 rounded-md">
        {type === "create" ? "Tạo bài luận" : "Cập nhật"}
      </button>
    </form>
  );
};

export default AssignmentForm;
