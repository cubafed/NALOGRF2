export function formatCount(value: number, emptyLabel = "0"): string {
  if (!Number.isFinite(value)) {
    return emptyLabel;
  }

  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatPercent(value: number, options?: { maximumFractionDigits?: number }): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value)}%`;
}

export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) {
    return "Нет данных";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Нет данных";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
