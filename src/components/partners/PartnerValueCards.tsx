interface PartnerValueCardsProps {
  variant?: "general" | "exchanges" | "accountants";
}

const generalCards = [
  {
    title: "Что получают пользователи",
    text: "Локальную загрузку Universal CSV, список missing data, review findings и report preview.",
  },
  {
    title: "Что получают партнеры",
    text: "Простой MVP tracking skeleton для ссылок с partner tag без серверной аналитики.",
  },
  {
    title: "Текущие ограничения",
    text: "Нет partner dashboard, affiliate payouts, backend analytics или интеграций с биржами.",
  },
];

const exchangeCards = [
  {
    title: "Зачем это биржам и P2P",
    text: "Пользователям часто нужно подготовить историю операций для банка, бухгалтера или налогового консультанта.",
  },
  {
    title: "Что есть сейчас",
    text: "Партнер может вести пользователя в upload/export flow. MVP поддерживает Universal CSV.",
  },
  {
    title: "Что позже",
    text: "Future versions may support exchange-specific import formats, but not in this PR.",
  },
];

const accountantCards = [
  {
    title: "Локальный CSV upload",
    text: "Клиент может загрузить CSV локально в браузере. Файл не отправляется на сервер в текущем MVP.",
  },
  {
    title: "Review findings",
    text: "Приложение подсвечивает missing data и source-of-funds gaps, которые may require explanation.",
  },
  {
    title: "Вопросы к клиенту",
    text: "Report preview помогает бухгалтеру или консультанту заранее собрать уточнения и документы.",
  },
];

export function PartnerValueCards({ variant = "general" }: PartnerValueCardsProps) {
  const cards =
    variant === "exchanges"
      ? exchangeCards
      : variant === "accountants"
        ? accountantCards
        : generalCards;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Value</p>
          <h2>Практическая польза MVP</h2>
        </div>
        <div className="grid-3">
          {cards.map((card, index) => (
            <article className="card" key={card.title}>
              <span className="card-number">0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
