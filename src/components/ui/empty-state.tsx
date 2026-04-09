import { LucideIcon } from "lucide-react";
import { EmptyStateIllustration } from "./illustrations";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="relative mb-4">
        <EmptyStateIllustration className="w-40 h-32 mx-auto" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-3 rounded-2xl bg-[var(--bg-card)] shadow-lg border border-[var(--border-default)]">
            <Icon className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-tertiary)] max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
