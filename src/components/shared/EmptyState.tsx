import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-slate-200 border-dashed animate-in fade-in duration-300">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-50 text-slate-400">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 text-sm text-slate-500 max-w-sm">{description}</p>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
