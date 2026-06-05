interface SavedReportStatusProps {
  message: string | null;
  tone?: "info" | "error" | "success";
}

export function SavedReportStatus({ message, tone = "info" }: SavedReportStatusProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={`status-text status-${tone}`} role="status">
      {message}
    </p>
  );
}
