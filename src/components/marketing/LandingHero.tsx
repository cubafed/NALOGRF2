"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, ArrowRight, ShieldCheck } from "lucide-react";
import { ReadinessGauge } from "@/components/ui/ReadinessGauge";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const DEMO_STATS = [
  { value: 39, label: "транзакций разобрано" },
  { value: 5, label: "finding rules" },
  { value: 11, label: "документов к подготовке" },
];

export function LandingHero() {
  return (
    <section className="container hero" style={{ position: "relative", overflow: "hidden" }}>
      <div className="hero-bg-anim" aria-hidden />

      {/* Left column */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={12} />
          Crypto Source-of-Funds Audit
        </p>

        <h1>
          Подготовьте крипто&shy;историю для банка, бухгалтера и налоговой
        </h1>

        <p className="lead">
          Загрузите операции с биржи — найдите проблемные места и получите
          структурированный отчет для проверки происхождения средств.
        </p>

        <div className="actions" style={{ marginTop: 32 }}>
          <Link href="/upload" className="btn btn-primary" style={{ gap: 8 }}>
            <Upload size={16} />
            Загрузить CSV
          </Link>
          <Link href="/demo" className="btn btn-secondary" style={{ gap: 8 }}>
            Посмотреть демо
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="hero-stats" style={{ marginTop: 40 }}>
          {DEMO_STATS.map((s) => (
            <div key={s.label}>
              <strong style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <AnimatedCounter value={s.value} duration={1000} />
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right column — gauge preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="panel" style={{ padding: 32, textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: 24 }}>Demo — readiness score</p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <ReadinessGauge score={42} label="high_risk" size={200} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
            <div className="metric">
              <span>Критичных</span>
              <strong style={{ color: "var(--red)" }}>2</strong>
            </div>
            <div className="metric">
              <span>Средних</span>
              <strong style={{ color: "var(--amber)" }}>2</strong>
            </div>
            <div className="metric">
              <span>Строк</span>
              <strong>42</strong>
            </div>
          </div>

          <p className="muted" style={{ marginTop: 18, fontSize: 12 }}>
            Загрузите свой CSV — получите реальный анализ
          </p>
        </div>
      </motion.div>
    </section>
  );
}
