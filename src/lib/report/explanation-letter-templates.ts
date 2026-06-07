/**
 * Deterministic explanation-letter templates for a source-of-funds package.
 *
 * These are fill-in DRAFTS that help a user legitimately explain the origin of their
 * funds to a bank or accountant (e.g. in response to a 115-ФЗ inquiry). They are NOT
 * legal advice, NOT a guarantee of any outcome, and contain NO techniques to avoid,
 * structure around, or defeat bank/AML controls. Figures are filled from the user's own
 * data; the user reviews and completes each draft.
 */

export interface ExplanationLetterTemplate {
  key: string;
  title: string;
  /** When this draft is relevant, in plain language. */
  appliesWhen: string;
  /** Draft body with concrete figures from the user's data; placeholders in [скобках]. */
  body: string;
}

export interface LetterContext {
  /** e.g. "2024", "2024–2025", or "—" when no dates are known. */
  periodLabel: string;
  /** Distinct source labels seen in the data. */
  sources: string[];
  /** Human-readable per-currency inflow summary lines. */
  inflowLines: string[];
  p2pCount: number;
  unknownSourceCount: number;
  largeDisposalCount: number;
  rapidTransitCount: number;
  concentratedCounterpartyCount: number;
  /** Russian-labelled document names attached to the package (for the cover letter). */
  attachedDocuments: string[];
  /**
   * Optional lines describing assets and realization — e.g. "BTC: 3 сделки продажи".
   * Used in bank cover and general letter to make the text more concrete.
   */
  assetSummaryLines?: string[];
  /** Number of income-type operations (income, mining reward, staking reward). */
  incomeCount?: number;
}

const DRAFT_NOTE =
  "Это черновик для проверки. Заполните данные в [скобках], приложите подтверждающие " +
  "документы и при необходимости согласуйте формулировки с бухгалтером или юристом.";

function sourcesSentence(sources: string[]): string {
  if (sources.length === 0) return "[укажите источники: биржи, кошельки, контрагенты]";
  return sources.join(", ");
}

export function buildSourceOfFundsLetter(ctx: LetterContext): ExplanationLetterTemplate {
  const inflow =
    ctx.inflowLines.length > 0
      ? ctx.inflowLines.map((line) => `  - ${line}`).join("\n")
      : "  - [укажите суммы поступлений по валютам]";

  return {
    key: "source_of_funds_general",
    title: "Пояснение об источнике средств",
    appliesWhen: "Базовое пояснение происхождения средств для банка или бухгалтера.",
    body: [
      "Кому: [наименование банка / получателя]",
      "От: [ФИО], [контактные данные]",
      `Период операций: ${ctx.periodLabel}`,
      "",
      "Настоящим поясняю происхождение средств по операциям с цифровыми активами.",
      `Источники операций: ${sourcesSentence(ctx.sources)}.`,
      "Сводка поступлений (по данным моей истории операций):",
      inflow,
      "",
      "Средства получены от законной деятельности: [покупка/продажа цифровых активов, " +
        "доход, личные накопления — уточните]. Подтверждающие документы прилагаю " +
        "(история операций, выписки, подтверждения сделок).",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildWalletOwnershipLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "wallet_ownership",
    title: "Подтверждение владения кошельком",
    appliesWhen: `Есть поступления из внешних/неочевидных источников (${ctx.unknownSourceCount}).`,
    body: [
      "Настоящим подтверждаю, что криптокошелёк с адресом [адрес кошелька] принадлежит мне.",
      "Поступления на этот адрес и переводы с него относятся к моим личным операциям.",
      "В подтверждение прилагаю: ссылки на транзакции в блокчейне [tx hash], историю " +
        "пополнений кошелька, а при возможности — подписанное сообщение с адреса.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildP2pNatureLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "p2p_nature",
    title: "Пояснение по P2P-операциям",
    appliesWhen: `В истории есть крупные P2P-операции (${ctx.p2pCount}).`,
    body: [
      "Поясняю характер P2P-операций за период " + ctx.periodLabel + ".",
      "P2P-операции представляют собой покупку/продажу цифровых активов с физическими " +
        "лицами через площадку [название площадки]. По каждой сделке прилагаю подтверждение " +
        "ордера, реквизиты перевода и сведения о контрагенте в объёме, доступном на площадке.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildBankCoverLetter(ctx: LetterContext): ExplanationLetterTemplate {
  const docs =
    ctx.attachedDocuments.length > 0
      ? ctx.attachedDocuments.map((d) => `  - ${d}`).join("\n")
      : "  - [перечислите прилагаемые документы]";

  const assetBlock =
    ctx.assetSummaryLines && ctx.assetSummaryLines.length > 0
      ? "\nСводка по активам:\n" + ctx.assetSummaryLines.map((l) => `  - ${l}`).join("\n")
      : "";

  return {
    key: "bank_cover",
    title: "Сопроводительное заявление в банк",
    appliesWhen: "Ответ на запрос банка о пояснениях по операциям.",
    body: [
      "Кому: [наименование банка]",
      "От: [ФИО], счёт [номер счёта], [контактные данные]",
      `Период операций: ${ctx.periodLabel}`,
      "",
      "В ответ на ваш запрос направляю пояснения и подтверждающие документы по моим " +
        "операциям с цифровыми активами. Прошу учесть приложенные материалы при рассмотрении.",
      `Источники операций: ${sourcesSentence(ctx.sources)}.` + assetBlock,
      "",
      "Прилагаю документы:",
      docs,
      "",
      "Готов(а) предоставить дополнительные пояснения и документы по запросу.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildRapidTransitLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "rapid_transit",
    title: "Пояснение по быстрому вводу и выводу средств",
    appliesWhen: `Есть поступления с быстрым последующим выводом (${ctx.rapidTransitCount}).`,
    body: [
      "Поясняю характер операций с быстрым вводом и последующим выводом средств за период " +
        ctx.periodLabel + ".",
      "Цель операций: [укажите цель — покупка/продажа цифровых активов, перевод между " +
        "собственными счетами, расчёт с контрагентом]. Средства относятся к моей личной " +
        "деятельности. Прилагаю банковскую выписку, историю операций и подтверждения сделок.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildConcentratedCounterpartyLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "concentrated_counterparty",
    title: "Пояснение по операциям с одним контрагентом",
    appliesWhen: `Есть концентрация операций с одним контрагентом (${ctx.concentratedCounterpartyCount}).`,
    body: [
      "Поясняю характер операций с контрагентом [имя/идентификатор контрагента] за период " +
        ctx.periodLabel + ".",
      "Характер отношений: [укажите — регулярная покупка/продажа цифровых активов, расчёты " +
        "по договору, переводы между собственными счетами]. Прилагаю подтверждения сделок и, " +
        "при наличии, документы, описывающие отношения с контрагентом.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildLargeDisposalLetter(ctx: LetterContext): ExplanationLetterTemplate {
  const assetBlock =
    ctx.assetSummaryLines && ctx.assetSummaryLines.length > 0
      ? "\nОперации реализации:\n" + ctx.assetSummaryLines.map((l) => `  - ${l}`).join("\n")
      : "";

  return {
    key: "large_disposal",
    title: "Пояснение по крупной продаже/выводу",
    appliesWhen: `Есть крупные продажи или выводы в fiat (${ctx.largeDisposalCount}).`,
    body: [
      "Поясняю крупные операции продажи/вывода средств за период " + ctx.periodLabel + "." +
        assetBlock,
      "Активы были ранее приобретены [дата/способ приобретения]; продажа/вывод отражают " +
        "реализацию ранее приобретённых активов. Прилагаю историю приобретения, подтверждение " +
        "сделки продажи и банковскую выписку по зачислению средств.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildMiningStakingLetter(ctx: LetterContext): ExplanationLetterTemplate {
  const count = ctx.incomeCount ?? 0;
  return {
    key: "mining_staking_income",
    title: "Пояснение по доходу от майнинга / стейкинга",
    appliesWhen: `В истории есть операции типа income/mining/staking${count > 0 ? ` (${count})` : ""}.`,
    body: [
      "Поясняю происхождение средств, поступивших в виде вознаграждения за период " +
        ctx.periodLabel + ".",
      "Средства получены в качестве дохода от [майнинга / стейкинга / вознаграждения " +
        "за участие в сети — уточните]. Вид деятельности: [личная / в рамках пула / договор].",
      "Полученные активы: [перечислите активы]. Актив был [продан / конвертирован / сохранён] " +
        "после получения. Поступления зафиксированы в истории операций, которую прилагаю.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildCryptoIncomeLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "crypto_income",
    title: "Пояснение по заработной плате / оплате в криптовалюте",
    appliesWhen: "Средства получены в качестве заработной платы или оплаты услуг в криптовалюте.",
    body: [
      "Поясняю происхождение средств, поступивших в виде оплаты за период " +
        ctx.periodLabel + ".",
      "Источник: заработная плата / оплата услуг по договору [номер/дата договора] с " +
        "[наименование работодателя / заказчика]. Расчёты производились в цифровых активах " +
        "согласно условиям договора.",
      "Полученные активы: [перечислите актив и сумму]. В подтверждение прилагаю: договор, " +
        "акт или иной документ, подтверждающий основание платежа, и историю транзакций.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildGiftInheritanceLetter(ctx: LetterContext): ExplanationLetterTemplate {
  return {
    key: "gift_inheritance",
    title: "Пояснение по подарку / наследованию активов",
    appliesWhen: "Активы получены в дар или по наследству.",
    body: [
      "Поясняю происхождение цифровых активов, полученных в качестве подарка / по " +
        "наследству за период " + ctx.periodLabel + ".",
      "Получатель: [ФИО]. Даритель / наследодатель: [ФИО]. Основание: [договор дарения / " +
        "свидетельство о праве на наследство — укажите реквизиты документа].",
      "Активы: [перечислите актив и объём]. В подтверждение прилагаю соответствующий " +
        "правоустанавливающий документ и историю транзакций.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}

export function buildPersonalSavingsLetter(ctx: LetterContext): ExplanationLetterTemplate {
  const inflow =
    ctx.inflowLines.length > 0
      ? ctx.inflowLines.map((line) => `  - ${line}`).join("\n")
      : "  - [укажите суммы по валютам]";

  return {
    key: "personal_savings",
    title: "Пояснение по личным накоплениям",
    appliesWhen: "Средства являются личными накоплениями / ранее сбережёнными активами.",
    body: [
      "Поясняю происхождение средств за период " + ctx.periodLabel + ".",
      "Средства представляют собой мои личные накопления, сформированные за счёт " +
        "[укажите: трудовых доходов / продажи имущества / иных законных источников].",
      "Сводка поступлений по данным истории операций:",
      inflow,
      "Подтверждающие документы: [банковские выписки, справки о доходах — уточните]. " +
        "Прилагаю историю операций с цифровыми активами за указанный период.",
      "",
      DRAFT_NOTE,
    ].join("\n"),
  };
}
