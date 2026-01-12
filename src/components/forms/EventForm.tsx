"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { eventFormSchema, eventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import InputField from "../InputField";

import z from "zod";

type EventFormInput = z.infer<typeof eventFormSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classesData: {
      id: number;
      name: string;
    }[];
  };
};

const EventForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues:
      type === "update"
        ? {
            ...data,
            startTime: data?.startTime
              ? new Date(data.startTime).toISOString().slice(0, 16)
              : undefined,
            endTime: data?.endTime
              ? new Date(data.endTime).toISOString().slice(0, 16)
              : undefined,
          }
        : undefined,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((formData) => {
    const parsed = eventSchema.parse(formData);
    startTransition(() => {
      formAction({
        ...parsed,
        // nếu không chọn lớp → event toàn trường
        classId: parsed.classId || null,
      });
    });
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast(`Sự kiện đã được ${type === "create" ? "tạo mới" : "cập nhật"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  /* ================= UI ================= */

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo sự kiện" : "Cập nhật sự kiện"}
      </h1>

      <InputField
        label="Tiêu đề"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors.title}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Mô tả</label>
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

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            {...register("startTime")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
          {errors.startTime && (
            <p className="text-xs text-red-400">{errors.startTime.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            {...register("endTime")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
          {errors.endTime && (
            <p className="text-xs text-red-400">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Phạm vi sự kiện</label>
        <select
          {...register("classId")}
          defaultValue={data?.classId ?? ""}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        >
          <option value="">Toàn trường</option>
          {relatedData?.classesData.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {type === "update" && (
        <input type="hidden" {...register("id")} value={data?.id} />
      )}

      {state.error && (
        <span className="text-red-500 text-sm">
          Có lỗi xảy ra, vui lòng thử lại!
        </span>
      )}

      <button className="bg-lamaYellow text-white py-2 rounded-md">
        {type === "create" ? "Tạo sự kiện" : "Cập nhật"}
      </button>
    </form>
  );
};

export default EventForm;
