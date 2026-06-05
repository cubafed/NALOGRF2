const steps = [
  {
    number: "01",
    title: "Импортируйте историю",
    text: "В будущих PR пользователь загрузит CSV с биржи или универсальный файл без передачи API-ключей.",
  },
  {
    number: "02",
    title: "Проверьте проблемные места",
    text: "Детерминированные правила найдут пропуски, P2P-поступления, крупные выводы и неизвестные источники.",
  },
  {
    number: "03",
    title: "Подготовьте отчет",
    text: "Отчет соберет summary, findings, документы к подготовке и понятное пояснение для консультанта.",
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
          {steps.map((step) => (
            <article className="card" key={step.number}>
              <span className="card-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
