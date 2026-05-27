import { filterBySearchKeys } from "@/services/table.service";

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

function isAllFilter(value: string | undefined): boolean {
  return !value || value === "ALL" || value === "TODOS";
}

export function matchesSearchTerm<T>(
  item: T,
  searchTerm: string,
  keys: string[],
): boolean {
  return filterBySearchKeys([item], searchTerm, keys).length > 0;
}

export function filterByStatus<T extends { status?: string | null }>(
  items: T[],
  status: string,
): T[] {
  if (isAllFilter(status)) return [...items];
  return items.filter((item) => item.status === status);
}

export function filterByLevel<T>(
  items: T[],
  level: string,
  getLevel: (item: T) => string | undefined,
): T[] {
  if (isAllFilter(level)) return [...items];
  return items.filter((item) => getLevel(item) === level);
}

export function filterByOption<T>(
  items: T[],
  selected: string,
  getter: (item: T) => string | undefined,
): T[] {
  if (isAllFilter(selected)) return [...items];
  return items.filter((item) => getter(item) === selected);
}

type DirectoryFilterOptions<T> = {
  searchTerm?: string;
  searchKeys?: string[];
  status?: string;
  getStatus?: (item: T) => string | undefined;
  level?: string;
  getLevel?: (item: T) => string | undefined;
  severity?: string;
  getSeverity?: (item: T) => string | undefined;
  reason?: string;
  getReason?: (item: T) => string | undefined;
};

export function filterDirectory<T>(
  items: T[],
  options: DirectoryFilterOptions<T> = {},
): T[] {
  const searched = options.searchKeys?.length
    ? filterBySearchKeys(items, options.searchTerm ?? "", options.searchKeys)
    : [...items];

  let filtered = searched;

  if (!isAllFilter(options.status)) {
    filtered = filtered.filter(
      (item) => options.getStatus?.(item) === options.status,
    );
  }

  if (!isAllFilter(options.level)) {
    filtered = filtered.filter(
      (item) => options.getLevel?.(item) === options.level,
    );
  }

  if (!isAllFilter(options.severity)) {
    filtered = filtered.filter(
      (item) => options.getSeverity?.(item) === options.severity,
    );
  }

  if (!isAllFilter(options.reason)) {
    filtered = filtered.filter(
      (item) => options.getReason?.(item) === options.reason,
    );
  }

  return filtered;
}
