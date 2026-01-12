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
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import z from "zod";

type ExamFormInput = z.infer<typeof examFormSchema>;

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormInput>({
    resolver: zodResolver(examFormSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useActionState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    const parsed = examSchema.parse(data);
    startTransition(() => {
      formAction(parsed);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Bài kiểm tra đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo bài kiểm tra mới" : "Cập nhật bài kiểm tra"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tên bài kiểm tra"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Thời gian bắt đầu"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="Thời gian kết thúc"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Tiết học</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={
              lessons.find(
                (lesson: {
                  id: number;
                  name: string;
                  class: any;
                  subject: any;
                }) => {
                  return lesson.id === data?.lessonId;
                }
              ).id
            }
          >
            {lessons.map(
              (lesson: {
                id: number;
                name: string;
                class: any;
                subject: any;
              }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.name +
                    " - " +
                    lesson.class.name +
                    " - " +
                    lesson.subject.name}
                </option>
              )
            )}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && <span className="text-red-500">Đã có lỗi!</span>}
      <button className="bg-lamaYellow text-white p-2 rounded-md">
        {type === "create" ? "Tạo mới" : "Cập nhật"}
      </button>
    </form>
  );
};

export default ExamForm;
