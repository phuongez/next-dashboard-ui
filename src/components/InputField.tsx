import { FieldError } from "react-hook-form";

type SafeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
>;

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: SafeInputProps;
  placeholder?: string;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
  placeholder,
}: InputFieldProps) => {
  return (
    <div
      className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-[30%]"}
    >
      <label className="text-xs text-gray-500">{label}</label>

      <input
        type={type}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...register(name)}
        {...inputProps}
      />

      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;

// import { FieldError } from "react-hook-form";

// type InputFieldProps = {
//   label: string;
//   type?: string;
//   register: any;
//   name: string;
//   defaultValue?: string;
//   error?: FieldError;
//   hidden?: boolean;
//   inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
//   placeholder?: string;
// };

// const InputField = ({
//   label,
//   type = "text",
//   register,
//   name,
//   defaultValue,
//   error,
//   hidden,
//   inputProps,
//   placeholder,
// }: InputFieldProps) => {
//   return (
//     <div
//       className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-[30%]"}
//     >
//       <label className="text-xs text-gray-500">{label}</label>
//       <input
//         type={type}
//         {...register(name)}
//         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//         {...inputProps}
//         defaultValue={defaultValue}
//         placeholder={placeholder}
//       />
//       {error?.message && (
//         <p className="text-xs text-red-400">{error.message.toString()}</p>
//       )}
//     </div>
//   );
// };

// export default InputField;
