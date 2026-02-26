import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  text = "Cargando...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      {text && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center h-64 border border-slate-100 rounded-lg bg-slate-50/50">
      {content}
    </div>
  );
}
