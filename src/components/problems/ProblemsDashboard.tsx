"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadLatestImportSession,
  clearLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { ProblemsSummary } from "./ProblemsSummary";
import { ProblemsFilterBar, type SeverityFilter } from "./ProblemsFilterBar";
import { ProblemFindingCard } from "./ProblemFindingCard";
import { ProblemsEmptyState } from "./ProblemsEmptyState";
import { ActionLink } from "@/components/ui/ActionLink";
import { DataPanel } from "@/components/ui/DataPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ProblemsDashboard() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  const handleClear = () => {
    clearLatestImportSession();
    setSession(null);
  };

  if (session === "loading") {
    return (
      <section className="panel">
        <div className="panel-inner">
          <p className="muted">Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return <ProblemsEmptyState />;
  }

  const { riskResult, parserSummary, parserErrors, parserWarnings, savedAt, fileName } = session;
  const findings = riskResult.findings;

  const counts = {
    all: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  const filtered = findings.filter((f: RiskFinding) => {
    if (filter !== "all" && f.severity !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.ruleId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="upload-stack">
      {/* Header info */}
      <div className="row-between">
        <div>
          <p className="eyebrow">Локальный сеанс</p>
          <h2 style={{ margin: 0 }}>{fileName ?? "Без имени файла"}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/report" className="btn btn-primary" style={{ fontSize: "13px" }}>
            Сформировать отчет
          </Link>
          <Link href="/upload" className="btn btn-secondary" style={{ fontSize: "13px" }}>
            Вернуться к импорту
          </Link>
          <button
            type="button"
            className="btn"
            style={{ fontSize: "12px", opacity: 0.7 }}
            onClick={handleClear}
          >
            Очистить локальный сеанс
          </button>
        </div>
      </div>

      {/* Privacy and disclaimer notes */}
      <NoticeCard title="Локальный режим" variant="info">
        <p className="muted">
          Данные обрабатываются локально в браузере, пока вы явно не сохраните отчет.
          Информационный отчет не является налоговой, юридической, финансовой или
          AML-консультацией.
        </p>
      </NoticeCard>

      {/* Summary cards */}
      <ProblemsSummary
        riskResult={riskResult}
        parserSummary={parserSummary}
        savedAt={savedAt}
      />

      {/* Parser issues note */}
      {(parserErrors.length > 0 || parserWarnings.length > 0) && (
        <DataPanel eyebrow="Импорт" title="Технические замечания">
            {parserErrors.length > 0 && (
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--red)" }}>
                {parserErrors.length} ошибок импорта — некоторые строки могли быть пропущены.
              </p>
            )}
            {parserWarnings.length > 0 && (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--amber)" }}>
                {parserWarnings.length} предупреждений импорта.
              </p>
            )}
            <p className="muted" style={{ marginTop: "8px", fontSize: "12px" }}>
              Для деталей импорта перейдите на{" "}
              <a href="/upload" style={{ color: "var(--blue)" }}>
                страницу загрузки
              </a>
              .
            </p>
        </DataPanel>
      )}

      {/* Findings section */}
      <DataPanel
        actions={<StatusBadge label={`${findings.length} найдено`} status={findings.length > 0 ? "needs_review" : "ready"} />}
        eyebrow="Список проблем"
        title="Проблемы для проверки"
      >

          {findings.length === 0 ? (
            <EmptyState
              description="Проблемы для проверки не найдены. Это не является налоговой, юридической, финансовой или AML-консультацией."
              primaryAction={<ActionLink href="/report" variant="primary">Открыть отчет</ActionLink>}
              title="Проблемы не найдены"
            />
          ) : (
            <>
              <ProblemsFilterBar
                active={filter}
                counts={counts}
                onFilter={setFilter}
                search={search}
                onSearch={setSearch}
              />

              {filtered.length === 0 ? (
                <p className="muted" style={{ marginTop: "16px" }}>
                  Нет проблем по выбранному фильтру.
                </p>
              ) : (
                <div className="review-findings-grid">
                  {filtered.map((f) => (
                    <ProblemFindingCard key={f.id} finding={f} />
                  ))}
                </div>
              )}
            </>
          )}
      </DataPanel>
    </div>
  );
}
