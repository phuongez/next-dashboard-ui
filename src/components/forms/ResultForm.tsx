"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { resultFormSchema, resultSchema } from "@/lib/formValidationSchemas";
import {
  createResult,
  getStudentsByAssessment,
  updateResult,
} from "@/lib/actions";

import z from "zod";

type ResultFormInput = z.infer<typeof resultFormSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    studentsData?: {
      id: string;
      name: string;
      surname: string;
    }[];
    exams?: {
      id: number;
      title: string;
      startTime: Date;
      lesson: any;
    }[];
    assignments?: {
      id: number;
      title: string;
      startDate: Date;
      lesson: any;
    }[];
  };
};

const ResultForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResultFormInput>({
    resolver: zodResolver(resultFormSchema),
    defaultValues:
      type === "update"
        ? {
            ...data,
            examId: data?.examId ?? undefined,
            assignmentId: data?.assignmentId ?? undefined,
          }
        : undefined,
  });
  const [filteredStudents, setFilteredStudents] = useState<
    { id: string; name: string; surname: string }[]
  >([]);

  const selectedExamId = watch("examId");
  const selectedAssignmentId = watch("assignmentId");

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedExamId) {
        const students = await getStudentsByAssessment(
          "exam",
          Number(selectedExamId)
        );
        setFilteredStudents(students);
      } else if (selectedAssignmentId) {
        const students = await getStudentsByAssessment(
          "assignment",
          Number(selectedAssignmentId)
        );
        setFilteredStudents(students);
      } else {
        setFilteredStudents([]);
      }
    };

    fetchStudents();
  }, [selectedExamId, selectedAssignmentId]);

  const [state, formAction] = useActionState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((formData) => {
    const parsed = resultSchema.parse(formData);
    startTransition(() => {
      formAction({
        ...parsed,
        examId: parsed.examId || null,
        assignmentId: parsed.assignmentId || null,
      });
    });
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast(`Kết quả đã được ${type === "create" ? "tạo mới" : "cập nhật"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  /* ================= UI ================= */

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Nhập kết quả" : "Cập nhật kết quả"}
      </h1>

      {/* ===== EXAM ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Bài kiểm tra</label>
        <select
          {...register("examId")}
          defaultValue={data?.examId ?? ""}
          disabled={!!selectedAssignmentId}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm disabled:bg-gray-100"
        >
          <option value="">— Không chọn —</option>
          {relatedData?.exams?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title +
                " - " +
                Intl.DateTimeFormat().format(e.startTime) +
                " - " +
                e.lesson.class.name}
            </option>
          ))}
        </select>
      </div>

      {/* ===== ASSIGNMENT ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Bài thi</label>
        <select
          {...register("assignmentId")}
          defaultValue={data?.assignmentId ?? ""}
          disabled={!!selectedExamId}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm disabled:bg-gray-100"
        >
          <option value="">— Không chọn —</option>
          {relatedData?.assignments?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title +
                " - " +
                Intl.DateTimeFormat().format(a.startDate) +
                " - " +
                a.lesson.class.name}
            </option>
          ))}
        </select>
      </div>

      {/* ===== STUDENT ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Học sinh</label>
        <select
          {...register("studentId")}
          disabled={filteredStudents.length === 0}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm disabled:bg-gray-100"
        >
          <option value="">Chọn học sinh</option>
          {filteredStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.surname}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-xs text-red-400">{errors.studentId.message}</p>
        )}
      </div>

      {/* ===== SCORE ===== */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Điểm</label>
        <input
          type="number"
          step="0.1"
          min={0}
          max={10}
          {...register("score")}
          defaultValue={data?.score}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        />
        {errors.score && (
          <p className="text-xs text-red-400">{errors.score.message}</p>
        )}
      </div>

      {/* ===== ID (update) ===== */}
      {type === "update" && (
        <input type="hidden" {...register("id")} value={data?.id} />
      )}

      {errors.examId && (
        <p className="text-xs text-red-400">{errors.examId.message}</p>
      )}

      {state.error && (
        <span className="text-red-500 text-sm">
          Có lỗi xảy ra, vui lòng thử lại!
        </span>
      )}

      <button className="bg-lamaYellow text-white py-2 rounded-md">
        {type === "create" ? "Lưu kết quả" : "Cập nhật"}
      </button>
    </form>
  );
};

export default ResultForm;
