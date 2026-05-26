export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string,
): T | undefined {
  if (!obj || !path) return undefined;

  return path
    .split(".")
    .reduce<unknown>((current, key) => {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== "object") return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj) as T | undefined;
}

export function filterBySearchKeys<T>(
  items: T[],
  searchTerm: string,
  keys: string[],
): T[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch || keys.length === 0) return [...items];

  return items.filter((item) =>
    keys.some((key) => {
      const value = getNestedValue(item, key);
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(normalizedSearch);
    }),
  );
}

export function normalizeSearchKeys(
  searchKey?: string | string[] | number | symbol,
): string[] {
  if (!searchKey) return [];
  return Array.isArray(searchKey)
    ? searchKey.map(String)
    : [String(searchKey)];
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return [];

  const safePage = Math.max(1, page);
  const startIndex = (safePage - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.ceil(totalItems / pageSize) || 1;
}

export function getPageRange(
  currentPage: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } {
  if (totalItems <= 0 || pageSize <= 0) return { start: 0, end: 0 };

  const safePage = Math.max(1, currentPage);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);

  return { start, end };
}

export function getAlignClass(align?: "left" | "center" | "right"): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function getFilteredTableData<T>(
  data: T[],
  search: string,
  searchKeys: string[],
): T[] {
  return searchKeys.length ? filterBySearchKeys(data, search, searchKeys) : data;
}
