import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={item.label} className="flex items-center space-x-2">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-emerald-700 hover:underline transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-slate-800 font-medium" : ""}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-slate-500">{description}</p>
        )}
      </div>

      {/* Action Area (e.g. Buttons) */}
      {action && <div className="flex shrink-0 flex-wrap">{action}</div>}
    </div>
  );
}
