"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { announcementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import InputField from "../InputField";

type AnnouncementSchema = z.infer<typeof announcementSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classesAnnouncement?: {
      id: number;
      name: string;
    }[];
  };
};

const AnnouncementForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues:
      type === "update"
        ? {
            ...data,
            date: data?.date
              ? new Date(data.date).toISOString().slice(0, 10)
              : undefined,
          }
        : undefined,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({
        ...formData,
        // không chọn lớp => toàn trường
        classId: formData.classId || null,
      });
    });
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast(`Thông báo đã được ${type === "create" ? "tạo mới" : "cập nhật"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  /* ================= UI ================= */

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo thông báo" : "Cập nhật thông báo"}
      </h1>

      {/* ===== TITLE ===== */}
      <InputField
        label="Tiêu đề"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors.title}
      />

      {/* ===== DESCRIPTION ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Nội dung</label>
        <textarea
          {...register("description")}
          defaultValue={data?.description}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          rows={4}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* ===== DATE ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Ngày thông báo</label>
        <input
          type="date"
          {...register("date")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        />
        {errors.date && (
          <p className="text-xs text-red-400">{errors.date.message}</p>
        )}
      </div>

      {/* ===== CLASS ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Phạm vi</label>
        <select
          {...register("classId")}
          defaultValue={data?.classId ?? ""}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        >
          <option value="">Toàn trường</option>
          {relatedData?.classesAnnouncement?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ===== ID (UPDATE) ===== */}
      {type === "update" && (
        <input type="hidden" {...register("id")} value={data?.id} />
      )}

      {state.error && (
        <span className="text-red-500 text-sm">
          Có lỗi xảy ra, vui lòng thử lại!
        </span>
      )}

      <button className="bg-lamaYellow text-white py-2 rounded-md">
        {type === "create" ? "Tạo thông báo" : "Cập nhật"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
