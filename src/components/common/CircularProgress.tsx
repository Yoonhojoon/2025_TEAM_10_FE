
import React from "react";
import { cn } from "@/lib/utils";
import { CirclePercent } from "lucide-react";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
  showValue?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

const CircularProgress = ({
  value,
  max = 100,
  size = "md",
  variant = "default",
  className,
  showValue = true,
  label,
  icon,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const sizeStyles = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };
  
  const variantStyles = {
    default: "text-primary stroke-primary",
    primary: "text-primary stroke-primary",
    success: "text-emerald-500 stroke-emerald-500",
    warning: "text-amber-500 stroke-amber-500",
    danger: "text-red-500 stroke-red-500",
  };
  
  const fontSizeStyles = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", sizeStyles[size])}>
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted stroke-[8] fill-none"
            cx="50"
            cy="50"
            r={radius}
          />
          
          {/* Progress circle */}
          <circle
            className={cn("fill-none stroke-[8] transition-all duration-500 ease-in-out", variantStyles[variant])}
            cx="50"
            cy="50"
            r={radius}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon || (
            showValue && (
              <div className={cn("font-semibold", fontSizeStyles[size])}>
                {percentage}%
              </div>
            )
          )}
        </div>
      </div>
      
      {label && (
        <div className="mt-2 text-center font-medium text-sm">{label}</div>
      )}
    </div>
  );
};

export { CircularProgress };
