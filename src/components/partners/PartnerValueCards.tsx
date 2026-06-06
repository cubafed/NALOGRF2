interface PartnerValueCardsProps {
  variant?: "general" | "exchanges" | "accountants";
}

const generalCards = [
  {
    title: "Что получают пользователи",
    text: "Локальную загрузку Universal CSV, список пробелов в данных, проблемы для проверки и предпросмотр отчета.",
  },
  {
    title: "Что получают партнеры",
    text: "Простой MVP-контур для ссылок с partner tag без серверной аналитики.",
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
    text: "Партнер может вести пользователя в локальный импорт и предпросмотр отчета. MVP поддерживает Universal CSV.",
  },
  {
    title: "Что позже",
    text: "Будущие версии могут поддерживать форматы отдельных бирж, но не в этом PR.",
  },
];

const accountantCards = [
  {
    title: "Локальный CSV импорт",
    text: "Клиент может загрузить CSV локально в браузере. Файл не отправляется на сервер в текущем MVP.",
  },
  {
    title: "Проблемы для проверки",
    text: "Приложение подсвечивает пробелы в данных и source-of-funds gaps, которые могут потребовать пояснений.",
  },
  {
    title: "Вопросы к клиенту",
    text: "Предпросмотр отчета помогает бухгалтеру или консультанту заранее собрать уточнения и документы.",
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
          <p className="eyebrow">Польза</p>
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
