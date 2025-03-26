
import { cn } from "@/lib/utils";
import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const ProgressBar = ({
  value,
  max = 100,
  className,
  variant = "default",
  label,
  showPercentage = false,
  size = "md",
  animated = true,
}: ProgressBarProps) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };
  
  const variantStyles = {
    default: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };
  
  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium">{percentage}%</span>
          )}
        </div>
      )}
      
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn(
            "transition-all duration-500 ease-out rounded-full",
            variantStyles[variant],
            sizeStyles[size],
            animated && "animate-pulse-soft"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
