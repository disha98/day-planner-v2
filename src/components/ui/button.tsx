"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "bg-stone-800 text-white hover:bg-stone-900 active:bg-stone-950 shadow-sm hover:shadow",
    secondary: "bg-white text-stone-700 hover:bg-stone-50 active:bg-stone-100 border border-stone-200 hover:border-stone-300 shadow-sm",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-800 active:bg-stone-150",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-150 border border-red-100",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-1.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
