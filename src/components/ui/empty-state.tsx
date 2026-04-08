import { LucideIcon } from "lucide-react";

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
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-teal-100 blur-lg scale-125 opacity-50" />
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50 p-5 border border-slate-100">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
