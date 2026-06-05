interface SaveReportButtonProps {
  isSaving: boolean;
  onSave: () => void;
}

export function SaveReportButton({ isSaving, onSave }: SaveReportButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onSave}
      disabled={isSaving}
    >
      {isSaving ? "Сохранение..." : "Сохранить отчет"}
    </button>
  );
}
