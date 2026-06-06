"use client";

import { motion } from "framer-motion";
import { Building2, Calculator, Archive } from "lucide-react";

const useCases = [
  {
    icon: <Building2 size={20} />,
    iconBg: "rgba(26,130,255,0.12)",
    iconColor: "var(--blue)",
    title: "Банк запросил происхождение средств",
    text: "Подготовьте структуру операций, список мест требующих пояснения и документы, которые нужно приложить.",
  },
  {
    icon: <Calculator size={20} />,
    iconBg: "rgba(255,189,90,0.12)",
    iconColor: "var(--amber)",
    title: "Бухгалтеру нужна понятная картина",
    text: "Покажите нормализованный обзор, проблемные операции и summary без доступа к вашим аккаунтам.",
  },
  {
    icon: <Archive size={20} />,
    iconBg: "rgba(0,200,122,0.12)",
    iconColor: "var(--green)",
    title: "Нужен личный финансовый архив",
    text: "Соберите криптоисторию в формате, который можно повторно проверить и обновить.",
  },
];

export function UseCases() {
  return (
    <section className="section" id="partners">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Для кого</p>
          <h2>Серьёзный аудит-слой для криптоопераций</h2>
        </div>

        <div className="grid-3">
          {useCases.map((item, i) => (
            <motion.article
              key={item.title}
              className="card panel-interactive"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: item.iconBg,
                  color: item.iconColor,
                  marginBottom: 14,
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ margin: 0, color: "#adb7c0", fontSize: 14 }}>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
