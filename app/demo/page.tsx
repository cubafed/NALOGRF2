import Link from "next/link";
import { FindingSummaryCard } from "@/components/audit/FindingSummaryCard";
import { ReportPreviewPanel } from "@/components/audit/ReportPreviewPanel";
import { RiskScoreCard } from "@/components/audit/RiskScoreCard";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { demoReport } from "@/lib/demo/demo-report";

export default function DemoPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="row-between" style={{ marginBottom: "28px" }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <p className="eyebrow">Демо-данные</p>
                <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                  Crypto Operations Audit Report
                </h1>
                <p className="lead" style={{ marginTop: "14px" }}>
                  Статический пример будущего Source-of-Funds отчета. Данные не
                  загружены пользователем и не являются расчетом.
                </p>
              </div>
              <Link href="/" className="btn btn-secondary">
                На главную
              </Link>
            </div>

            <div className="grid-3" style={{ alignItems: "stretch" }}>
              <RiskScoreCard
                label="Readiness / risk score"
                score={demoReport.readinessScore}
                subtitle="64/100 означает, что отчет уже полезен для обзора, но требует документов и пояснений по отмеченным операциям."
              />
              <div className="panel">
                <div className="panel-inner">
                  <p className="eyebrow">Scope</p>
                  <div className="metric-grid">
                    <div className="metric">
                      <span>Операции</span>
                      <strong>{demoReport.operationsCount}</strong>
                    </div>
                    <div className="metric">
                      <span>Период</span>
                      <strong>{demoReport.period.label}</strong>
                    </div>
                    <div className="metric">
                      <span>Findings</span>
                      <strong>{demoReport.findings.length}</strong>
                    </div>
                    <div className="metric">
                      <span>Status</span>
                      <strong>Demo</strong>
                    </div>
                  </div>
                </div>
              </div>
              <ReportPreviewPanel report={demoReport} />
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Findings</p>
              <h2>Проблемные места и рекомендуемые действия</h2>
            </div>
            <div className="grid-3">
              {demoReport.findings.map((finding) => (
                <FindingSummaryCard finding={finding} key={finding.ruleId} />
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="panel">
              <div className="panel-inner">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Sample transactions</p>
                    <h2 style={{ margin: 0 }}>Операции из демо-отчета</h2>
                  </div>
                  <span className="badge">Демо-данные</span>
                </div>
                <div style={{ overflowX: "auto", marginTop: "18px" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Источник</th>
                        <th>Тип</th>
                        <th>Актив</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoReport.sampleTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td>{tx.source}</td>
                          <td>{tx.type}</td>
                          <td>{tx.asset}</td>
                          <td>{tx.amount}</td>
                          <td>{tx.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
