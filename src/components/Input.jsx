/* eslint-disable jsx-a11y/label-has-associated-control */
import clsxm from "@/utils/clsxm";
import React from "react";


export default function Input({
  register,
  className,
  labelCss,
  error,
  type,
  min,
  Label,
  placeholder,
  fullWidth,  // Destructure to prevent passing to DOM
  margin,     // Destructure to prevent passing to DOM
  ...others
}) {
  return (
    <div>
      {Label && (
        <label
          className={clsxm(
            "text-white text-14 sm:text-md capitalize",
            error?.message && "text-[red]",
            labelCss
          )}
        >
          {Label}
        </label>
      )}
      <input
        type={type}
        min={min}
        id="large-input"
        placeholder={placeholder}
        {...register}
        className={clsxm(
          "w-full p-2 outline-none rounded-[8px] bg-[transparent] bo placeholder:text-gray-light sm:text-md focus:ring-blue-100 focus:border-Yellow-100",
          error?.message
            ? "border border-[red] rounded-[8px] bg-none "
            : "border border-black-100 bg-none ",
          className
        )}
        {...others}
      />

      {error?.message && (
        <span className="text-[red] text-xs">{error?.message}</span>
      )}
    </div>
  );
}
