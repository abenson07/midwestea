import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "ghost" | "ghostInverse";
  type?: "button" | "submit" | "reset";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  type = "button",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "min-h-11 px-4 py-2.5 text-mercury-xs font-[450] sm:min-h-0",
    md: "min-h-11 px-4 py-2.5 text-mercury-small font-[450] sm:px-4 sm:py-2 sm:min-h-10 md:min-h-11 md:py-3",
  };

  const variantClasses = {
    primary:
      "rounded-mercury-button-lg bg-brand-500 text-mercury-on-accent shadow-mercury-low hover:bg-brand-600 hover:text-white disabled:bg-brand-300 font-[360]",
    outline:
      "rounded-mercury-button-lg bg-white text-mercury-ink ring-1 ring-inset ring-mercury-line hover:bg-gray-50 font-[360] dark:bg-white/[0.04] dark:text-white/85 dark:ring-white/10 dark:hover:bg-white/[0.08]",
    ghost:
      "rounded-mercury-button bg-transparent px-2 text-mercury-ink hover:bg-gray-50 font-[360] dark:text-white/85 dark:hover:bg-white/5",
    ghostInverse:
      "rounded-mercury-button-lg bg-transparent px-3 text-mercury-muted hover:bg-gray-50 font-[360] dark:text-white/55 dark:hover:bg-white/5",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
