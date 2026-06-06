"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Lock, Info } from "lucide-react";
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
      <div className="upload-stack">
        <div className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius-md)" }} />
      </div>
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
    <motion.div
      className="upload-stack"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header info */}
      <div className="row-between">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileText size={20} color="var(--blue)" />
          <div>
            <p className="eyebrow">Локальный сеанс</p>
            <h2 style={{ margin: 0 }}>{fileName ?? "Без имени файла"}</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/report" className="btn btn-primary" style={{ fontSize: "13px" }}>
            Сформировать отчет
          </Link>
          <button
            type="button"
            className="btn"
            style={{ fontSize: "12px", opacity: 0.7 }}
            onClick={handleClear}
          >
            Очистить данные
          </button>
        </div>
      </div>

      {/* Privacy and disclaimer notes */}
      <section className="panel">
        <div className="panel-inner" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
            <Lock size={12} color="var(--green)" style={{ flexShrink: 0 }} />
            Данные обрабатываются локально в браузере и не передаются на сервер.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
            <Info size={12} style={{ flexShrink: 0 }} />
            Информационный отчет. Не является налоговой, юридической, финансовой или AML-консультацией.
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <ProblemsSummary
        riskResult={riskResult}
        parserSummary={parserSummary}
        savedAt={savedAt}
      />

      {/* Parser issues note */}
      {(parserErrors.length > 0 || parserWarnings.length > 0) && (
        <section className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Технические замечания импорта</p>
            {parserErrors.length > 0 && (
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--red)" }}>
                {parserErrors.length} ошибок парсера — некоторые строки могли быть пропущены.
              </p>
            )}
            {parserWarnings.length > 0 && (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--amber)" }}>
                {parserWarnings.length} предупреждений парсера.
              </p>
            )}
            <p className="muted" style={{ marginTop: "8px", fontSize: "12px" }}>
              Для деталей импорта перейдите на{" "}
              <a href="/upload" style={{ color: "var(--blue)" }}>
                страницу загрузки
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* Findings section */}
      <section className="panel">
        <div className="panel-inner">
          <p className="eyebrow">Список проблем</p>
          <h2 style={{ margin: "0 0 16px" }}>
            Проблемы для проверки
          </h2>

          {findings.length === 0 ? (
            <p className="muted">
              Проблемы для проверки не найдены. Это не является налоговой, юридической,
              финансовой или AML-консультацией.
            </p>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map((f, i) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <ProblemFindingCard finding={f} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}
