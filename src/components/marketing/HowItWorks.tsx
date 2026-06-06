"use client";

import { motion } from "framer-motion";
import { UploadCloud, ScanLine, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <UploadCloud size={22} />,
    iconBg: "rgba(26,130,255,0.12)",
    iconColor: "var(--blue)",
    title: "Импортируйте историю",
    text: "Загрузите CSV с биржи или универсальный файл без передачи API-ключей. Данные остаются в вашем браузере.",
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
    icon: <FileCheck size={22} />,
    iconBg: "rgba(0,200,122,0.12)",
    iconColor: "var(--green)",
    title: "Подготовьте отчет",
    text: "Отчет соберет findings, чек-лист документов и понятные вопросы для объяснения банку или консультанту.",
  },
];

export function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Как работает</p>
          <h2>От хаотичной истории операций к проверяемому отчету</h2>
        </div>

        <div className="grid-3">
          {steps.map((step, i) => (
            <motion.article
              key={step.number}
              className="card panel-interactive"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {/* Step number watermark */}
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
  );
}
