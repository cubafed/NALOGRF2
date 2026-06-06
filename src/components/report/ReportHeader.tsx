import { FileText, Calendar, Shield } from "lucide-react";

interface ReportHeaderProps {
  fileName: string | null;
  savedAt: string;
}

export function ReportHeader({ fileName, savedAt }: ReportHeaderProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              background: "rgba(26,130,255,0.12)",
              color: "var(--blue)",
              flexShrink: 0,
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <p className="eyebrow">Предпросмотр отчета</p>
            <h2 style={{ margin: 0, fontSize: 18 }}>Отчет для проверки источника средств</h2>
          </div>
          <span className="badge" style={{ marginLeft: "auto" }}>Локальный сеанс</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              flex: 1,
              minWidth: 180,
            }}
          >
            <FileText size={14} color="var(--muted)" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Файл</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>
                {fileName ?? "Без имени файла"}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              flex: 1,
              minWidth: 180,
            }}
          >
            <Calendar size={14} color="var(--muted)" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Сформировано</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                {new Date(savedAt).toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
