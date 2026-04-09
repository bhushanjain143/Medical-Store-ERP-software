import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border min-w-0 overflow-hidden transition-all duration-300",
        "bg-[var(--bg-card)] border-[var(--border-default)] shadow-[var(--shadow-card)]",
        hover && "card-hover cursor-default",
        glass && "glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-default)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 sm:px-6 py-3.5 sm:py-4", className)} {...props}>
      {children}
    </div>
  );
}
