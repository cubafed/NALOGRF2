import type { ReportQuestion } from "@/lib/report/report-types";

interface ReportQuestionsSectionProps {
  questions: ReportQuestion[];
}

export function ReportQuestionsSection({ questions }: ReportQuestionsSectionProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Вопросы для проверки</p>
        <h2 style={{ margin: "0 0 6px" }}>
          Что может спросить банк, бухгалтер или налоговый консультант
        </h2>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: "13px" }}>
          Вопросы сформированы из найденных проблем и помогают заранее подготовить пояснения.
        </p>

        {questions.length === 0 ? (
          <p className="muted">Вопросы не сформированы — проблемы для проверки не найдены.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {questions.map((q) => (
              <article className="finding" key={q.id}>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{q.question}</p>
                <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
                  <strong>Почему это важно:</strong> {q.whyItMatters}
                </p>
                <p className="muted" style={{ margin: 0, fontSize: "11px" }}>
                  {q.ruleId}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
