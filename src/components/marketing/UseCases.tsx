const useCases = [
  {
    title: "Банк запросил происхождение средств",
    text: "Подготовьте структуру операций, список спорных мест и документы, которые нужно приложить.",
  },
  {
    title: "Бухгалтеру нужна понятная картина",
    text: "Покажите normalized view, проблемные операции и summary без доступа к вашим аккаунтам.",
  },
  {
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
          <h2>Серьезный аудит-слой для криптоопераций, а не обещание налоговой гарантии</h2>
        </div>
        <div className="grid-3">
          {useCases.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
