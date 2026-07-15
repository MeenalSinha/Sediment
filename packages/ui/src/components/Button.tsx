import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "gold" | "success";
  size?: "sm" | "md";
}

const VARIANT_MAP: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-teal-700 hover:bg-teal-600 text-sand-50 border border-teal-500/40 shadow-button-base active:shadow-button-pressed",
  secondary: "bg-stone-gradient hover:brightness-110 text-sand-100 border border-stone-600/60 shadow-button-base active:shadow-button-pressed",
  ghost: "bg-transparent hover:bg-stone-800/60 text-sand-200 border border-stone-700/60",
  gold: "bg-gold-gradient hover:brightness-110 text-stone-950 border-[2px] border-gold-300 shadow-button-base active:shadow-button-pressed font-bold",
  success: "bg-success-gradient hover:brightness-110 text-white border-[2px] border-success-500 shadow-button-base active:shadow-button-pressed font-bold",
};

export function Button({ children, variant = "primary", size = "md", className = "", ...rest }: ButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm";
  return (
    <button
      className={`rounded-lg tracking-wide transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 uppercase ${VARIANT_MAP[variant]} ${sizeClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
