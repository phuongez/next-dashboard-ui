"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parentFormSchema, parentSchema } from "@/lib/formValidationSchemas";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { createParent, updateParent } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

import z from "zod";

type ParentFormInput = z.infer<typeof parentFormSchema>;

type Props = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students: {
      id: string;
      name: string;
      surname: string;
    }[];
  };
};

const ParentForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentFormInput>({
    resolver: zodResolver(parentFormSchema),
    defaultValues:
      type === "update"
        ? {
            ...data,
            students: data?.students?.map((s: any) => s.id),
          }
        : undefined,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createParent : updateParent,
    {
      success: false,
      error: false,
    },
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((formData) => {
    const parsed = parentSchema.parse(formData);
    startTransition(() => {
      formAction({
        ...parsed,

        // 🛡️ nếu update mà không đổi students → giữ nguyên
        students:
          parsed.students && parsed.students.length > 0
            ? parsed.students
            : data?.students?.map((s: any) => s.id),
      });
    });
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast(`Phụ huynh đã được ${type === "create" ? "tạo mới" : "cập nhật"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  /* ================= UI ================= */

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo phụ huynh mới" : "Cập nhật phụ huynh"}
      </h1>

      {/* ===== LOGIN INFO ===== */}
      <span className="text-xs text-gray-400 font-medium">
        Thông tin đăng nhập
      </span>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Tên đăng nhập"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />

        <InputField
          label="Mật khẩu"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          placeholder={type === "update" ? "Để trống nếu không đổi" : undefined}
        />
      </div>

      {/* ===== PERSONAL INFO ===== */}
      <span className="text-xs text-gray-400 font-medium">
        Thông tin cá nhân
      </span>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Tên"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />

        <InputField
          label="Họ & tên đệm"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />

        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors.email}
        />

        <InputField
          label="Điện thoại"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Địa chỉ"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />

        {type === "update" && (
          <InputField
            label="ID"
            name="id"
            defaultValue={data?.id}
            register={register}
            hidden
          />
        )}
      </div>

      {/* ===== STUDENTS ===== */}
      {/* <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Con đang theo học</label>

        <select
          multiple
          {...register("students")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        >
          {relatedData?.students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.surname}
            </option>
          ))}
        </select>

        {errors.students?.message && (
          <p className="text-xs text-red-400">
            {errors.students.message.toString()}
          </p>
        )}
      </div> */}

      {state.error && (
        <span className="text-red-500 text-sm">
          Có lỗi xảy ra. Vui lòng thử lại!
        </span>
      )}

      <button className="bg-lamaYellow text-white py-2 rounded-md">
        {type === "create" ? "Tạo mới" : "Cập nhật"}
      </button>
    </form>
  );
};

export default ParentForm;
