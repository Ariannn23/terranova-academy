import { filterBySearchKeys } from "@/services/table.service";

export function filterByStatus<T extends { status?: string | null }>(
  items: T[],
  status: string,
): T[] {
  if (!status || status === "TODOS") return [...items];
  return items.filter((item) => item.status === status);
}

export function filterByLevel<T>(
  items: T[],
  level: string,
  getLevel: (item: T) => string | undefined,
): T[] {
  if (!level || level === "TODOS") return [...items];
  return items.filter((item) => getLevel(item) === level);
}

type DirectoryFilterOptions<T> = {
  searchTerm?: string;
  searchKeys?: string[];
  status?: string;
  getStatus?: (item: T) => string | undefined;
};

export function filterDirectory<T>(
  items: T[],
  options: DirectoryFilterOptions<T> = {},
): T[] {
  const searched = options.searchKeys?.length
    ? filterBySearchKeys(items, options.searchTerm ?? "", options.searchKeys)
    : [...items];

  if (!options.status || options.status === "TODOS") return searched;

  return searched.filter((item) => options.getStatus?.(item) === options.status);
}
