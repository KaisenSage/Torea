import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-black text-white hover:bg-zinc-800"
          : "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50",
        className,
      )}
      {...props}
    />
  );
}
