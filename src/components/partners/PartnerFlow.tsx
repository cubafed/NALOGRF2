const flowSteps = [
  {
    title: "Партнер дает ссылку",
    text: "Ссылка может содержать partner, ref и UTM-параметры для будущей атрибуции.",
  },
  {
    title: "Пользователь открывает upload",
    text: "MVP сохраняет partner attribution локально в браузере и показывает активный partner tag.",
  },
  {
    title: "CSV обрабатывается локально",
    text: "Universal CSV parser, review findings и report preview работают без отправки файлов на сервер.",
  },
];

export function PartnerFlow() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">How referrals will work</p>
          <h2>Как будет работать переход от партнера</h2>
        </div>
        <div className="partner-flow-list">
          {flowSteps.map((step, index) => (
            <article className="panel" key={step.title}>
              <div className="panel-inner">
                <span className="card-number">0{index + 1}</span>
                <h3 style={{ margin: "8px 0" }}>{step.title}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {step.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
