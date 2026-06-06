import type { FindingSeverity } from "@/lib/domain/types";
import type { ReadinessLabel } from "@/lib/risk/risk-types";

export type ProductStatus =
  | "ready"
  | "needs_review"
  | "not_configured"
  | "local"
  | "saved"
  | "error"
  | "unavailable"
  | "draft"
  | "active"
  | "loading"
  | "signed_out"
  | "signed_in"
  | "unknown";

export interface StatusMeta {
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
}

const statusLabels: Record<ProductStatus, StatusMeta> = {
  ready: { label: "Готово", tone: "success" },
  needs_review: { label: "Требует проверки", tone: "warning" },
  not_configured: { label: "Не настроено", tone: "warning" },
  local: { label: "Локальный режим", tone: "info" },
  saved: { label: "Сохранено", tone: "success" },
  error: { label: "Ошибка", tone: "danger" },
  unavailable: { label: "Недоступно", tone: "neutral" },
  draft: { label: "Черновик", tone: "neutral" },
  active: { label: "Активно", tone: "success" },
  loading: { label: "Проверка...", tone: "info" },
  signed_out: { label: "Вход не выполнен", tone: "neutral" },
  signed_in: { label: "Активно", tone: "success" },
  unknown: { label: "Недоступно", tone: "neutral" },
};

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (!status) {
    return statusLabels.unknown;
  }

  return statusLabels[status as ProductStatus] ?? statusLabels.unknown;
}

export function getReadinessStatus(label: ReadinessLabel): ProductStatus {
  if (label === "good") return "ready";
  if (label === "needs_review") return "needs_review";
  return "error";
}

export function getSeverityLabel(severity: string | null | undefined): string {
  const labels: Record<FindingSeverity, string> = {
    critical: "Критичная",
    medium: "Средняя",
    low: "Низкая",
  };

  return labels[severity as FindingSeverity] ?? "Недоступно";
}
