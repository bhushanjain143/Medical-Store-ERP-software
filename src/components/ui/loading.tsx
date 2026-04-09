import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className || ""}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 relative" />
      </div>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-fade-in">
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-xl animate-pulse scale-150" />
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 relative mx-auto mb-4" />
        </div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
