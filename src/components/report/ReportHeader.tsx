interface ReportHeaderProps {
  fileName: string | null;
  savedAt: string;
}

export function ReportHeader({ fileName, savedAt }: ReportHeaderProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Предпросмотр отчета</p>
            <h2 style={{ margin: 0 }}>Отчет для проверки источника средств</h2>
          </div>
          <span className="badge">Локальный сеанс</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Файл</span>
            <strong style={{ overflowWrap: "anywhere" }}>
              {fileName ?? "Без имени файла"}
            </strong>
          </div>
          <div className="metric">
            <span>Сформировано из данных от</span>
            <strong style={{ fontSize: "13px" }}>
              {new Date(savedAt).toLocaleString("ru-RU")}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
