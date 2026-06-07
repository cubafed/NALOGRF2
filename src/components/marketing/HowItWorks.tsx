"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UploadCloud, ScanLine, FileCheck, Calculator, BarChart3, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <UploadCloud size={22} />,
    iconBg: "rgba(26,130,255,0.12)",
    iconColor: "var(--blue)",
    title: "Импортируйте историю",
    text: "CSV с Binance, Bybit, OKX, KuCoin, Kraken или универсальный файл. Данные остаются в вашем браузере — никаких API-ключей.",
  },
  {
    number: "02",
    icon: <ScanLine size={22} />,
    iconBg: "rgba(255,189,90,0.12)",
    iconColor: "var(--amber)",
    title: "Проверьте проблемные места",
    text: "Детерминированные правила найдут пропуски в истории, P2P-поступления, крупные выводы и неизвестные источники.",
  },
  {
    number: "03",
    icon: <Calculator size={22} />,
    iconBg: "rgba(0,200,122,0.12)",
    iconColor: "var(--green)",
    title: "Рассчитайте налог",
    text: "FIFO/LIFO/HIFO/ACB лот-матчинг, курсы ЦБ РФ и CoinGecko по датам. Предварительная оценка для проверки с бухгалтером.",
  },
  {
    number: "04",
    icon: <ShieldCheck size={22} />,
    iconBg: "rgba(26,130,255,0.08)",
    iconColor: "var(--blue)",
    title: "Подготовьте пакет 115-ФЗ",
    text: "Заявление в банк, письма по P2P, быстрому транзиту, майнингу, зарплате в крипте — черновики на основе ваших данных.",
  },
  {
    number: "05",
    icon: <BarChart3 size={22} />,
    iconBg: "rgba(255,189,90,0.08)",
    iconColor: "var(--amber)",
    title: "Аналитика и портфель",
    text: "Графики потоков, распределение источников, холдинги, реализованный и нереализованный P&L по активам.",
  },
  {
    number: "06",
    icon: <FileCheck size={22} />,
    iconBg: "rgba(0,200,122,0.08)",
    iconColor: "var(--green)",
    title: "Экспортируйте отчет",
    text: "Полный пакет в Markdown и JSON для банка, бухгалтера или налогового консультанта. Всё локально, без облака.",
  },
];

const EXCHANGES = ["Binance", "Bybit", "OKX", "KuCoin", "Kraken"];

export function HowItWorks() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Как работает</p>
            <h2>От хаотичной истории операций к проверяемому отчету</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {steps.map((step, i) => (
              <motion.article
                key={step.number}
                className="card panel-interactive"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                style={{ position: "relative", overflow: "hidden" }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 12,
                    fontSize: 72,
                    fontWeight: 950,
                    color: "rgba(255,255,255,0.03)",
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {step.number}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: step.iconBg,
                    color: step.iconColor,
                    marginBottom: 14,
                  }}
                >
                  {step.icon}
                </div>

                <h3 style={{ margin: "0 0 8px" }}>{step.title}</h3>
                <p style={{ margin: 0, color: "#adb7c0", fontSize: 14 }}>{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Supported exchanges strip */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              padding: "20px 24px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              background: "var(--panel-2)",
            }}
          >
            <p className="eyebrow" style={{ margin: 0, flexShrink: 0 }}>
              Поддерживаемые биржи:
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {EXCHANGES.map((ex) => (
                <span key={ex} className="badge" style={{ fontSize: 13, padding: "4px 12px" }}>
                  {ex}
                </span>
              ))}
              <span className="badge" style={{ fontSize: 13, padding: "4px 12px", opacity: 0.6 }}>
                + универсальный CSV
              </span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Link href="/upload" className="btn btn-primary" style={{ fontSize: 13 }}>
                Загрузить CSV
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
