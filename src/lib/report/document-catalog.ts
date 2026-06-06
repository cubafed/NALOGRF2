import type { DocumentCatalogEntry } from "./document-checklist-types";

export const DOCUMENT_CATALOG: DocumentCatalogEntry[] = [
  {
    key: "bank_statement",
    ru: "Банковская выписка",
    en: "Bank statement",
    description:
      "Выписка по счёту из банка, подтверждающая движение средств. Может быть запрошена банком или бухгалтером для сверки с крипто-операциями.",
    category: "bank",
  },
  {
    key: "exchange_trade_history",
    ru: "История торгов на бирже",
    en: "Exchange trade history",
    description:
      "Полная история сделок с биржи в формате CSV или PDF. Может понадобиться для подтверждения покупок, продаж и обменов.",
    category: "exchange",
  },
  {
    key: "exchange_statement",
    ru: "Выписка с биржи",
    en: "Exchange statement",
    description:
      "Официальная выписка или экспорт аккаунта с криптобиржи. Подтверждает историю операций и баланс.",
    category: "exchange",
  },
  {
    key: "price_source",
    ru: "Источник цены актива",
    en: "Price source",
    description:
      "Документ или скриншот с ценой актива на дату операции (напр. CoinGecko, биржевой тикер). Может понадобиться бухгалтеру для расчёта fiat-стоимости.",
    category: "accounting",
  },
  {
    key: "accountant_note",
    ru: "Пояснительная записка от бухгалтера",
    en: "Accountant note",
    description:
      "Письменное пояснение от бухгалтера или консультанта по операциям, требующим дополнительного обоснования.",
    category: "accounting",
  },
  {
    key: "p2p_order_proof",
    ru: "Подтверждение P2P-сделки",
    en: "P2P order proof",
    description:
      "Скриншот или экспорт ордера с P2P-платформы. Может быть запрошен банком для подтверждения источника средств по P2P-операциям.",
    category: "p2p",
  },
  {
    key: "sell_order",
    ru: "Подтверждение ордера на продажу",
    en: "Sell order",
    description:
      "Подтверждение сделки продажи актива. Может быть запрошено для объяснения поступления fiat-средств.",
    category: "exchange",
  },
  {
    key: "withdrawal_record",
    ru: "Запись о выводе средств",
    en: "Withdrawal record",
    description:
      "Документ, подтверждающий вывод средств с биржи или кошелька (история транзакций, email-подтверждение).",
    category: "exchange",
  },
  {
    key: "acquisition_history",
    ru: "История приобретения актива",
    en: "Acquisition history",
    description:
      "Документы, подтверждающие факт и дату покупки или получения актива. Необходимы для установления первоначальной стоимости.",
    category: "exchange",
  },
  {
    key: "acquisition_record",
    ru: "Запись о приобретении актива",
    en: "Acquisition record",
    description:
      "Подтверждение конкретной покупки или получения актива (ордер на покупку, подтверждение транзакции).",
    category: "exchange",
  },
  {
    key: "wallet_ownership_note",
    ru: "Подтверждение владения кошельком",
    en: "Wallet ownership note",
    description:
      "Пояснение или подписанное сообщение, подтверждающее, что кошелёк принадлежит вам. Может понадобиться при поступлениях из внешних кошельков.",
    category: "wallet",
  },
  {
    key: "blockchain_transaction_link",
    ru: "Ссылка на транзакцию в блокчейне",
    en: "Blockchain transaction link",
    description:
      "Прямая ссылка на транзакцию в блок-эксплорере (напр. Etherscan, BTC Explorer). Подтверждает факт и детали операции.",
    category: "wallet",
  },
  {
    key: "prior_exchange_withdrawal",
    ru: "Более ранний вывод с биржи",
    en: "Prior exchange withdrawal",
    description:
      "Запись о выводе средств с биржи, предшествующем поступлению на кошелёк. Помогает установить цепочку источников.",
    category: "exchange",
  },
  {
    key: "source_row",
    ru: "Исходная строка из файла",
    en: "Source row",
    description:
      "Оригинальная строка из загруженного файла истории операций, требующая ручной проверки или уточнения.",
    category: "other",
  },
  {
    key: "manual_classification_note",
    ru: "Пояснение к классификации операции",
    en: "Manual classification note",
    description:
      "Письменное пояснение типа операции, которая не была распознана автоматически. Помогает при проверке бухгалтером.",
    category: "accounting",
  },
  {
    key: "earlier_exchange_history",
    ru: "Более ранняя история с биржи",
    en: "Earlier exchange history",
    description:
      "История операций за более ранний период, подтверждающая приобретение актива до отражённых продаж или конверсий.",
    category: "exchange",
  },
  {
    key: "wallet_deposit_history",
    ru: "История пополнений кошелька",
    en: "Wallet deposit history",
    description:
      "История входящих транзакций кошелька. Может подтвердить источник средств при отсутствии биржевой истории.",
    category: "wallet",
  },
];

const catalogMap = new Map<string, DocumentCatalogEntry>(
  DOCUMENT_CATALOG.map((entry) => [normalizeToken(entry.key), entry]),
);

const aliasMap = new Map<string, string>([
  ["bank statement", "bank_statement"],
  ["exchange trade history", "exchange_trade_history"],
  ["exchange statement", "exchange_statement"],
  ["price source", "price_source"],
  ["accountant note", "accountant_note"],
  ["p2p order proof", "p2p_order_proof"],
  ["sell order", "sell_order"],
  ["withdrawal record", "withdrawal_record"],
  ["acquisition history", "acquisition_history"],
  ["acquisition record", "acquisition_record"],
  ["wallet ownership note", "wallet_ownership_note"],
  ["blockchain transaction link", "blockchain_transaction_link"],
  ["prior exchange withdrawal", "prior_exchange_withdrawal"],
  ["source row", "source_row"],
  ["manual classification note", "manual_classification_note"],
  ["earlier exchange history", "earlier_exchange_history"],
  ["wallet deposit history", "wallet_deposit_history"],
]);

export function resolveDocument(token: string): DocumentCatalogEntry {
  const normalized = normalizeToken(token);

  const canonical = aliasMap.get(normalized);
  if (canonical) {
    const entry = catalogMap.get(normalizeToken(canonical));
    if (entry) return entry;
  }

  const direct = catalogMap.get(normalized);
  if (direct) return direct;

  return {
    key: slugify(token),
    ru: token,
    en: token,
    description: "",
    category: "other",
  };
}

function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

function slugify(token: string): string {
  return token
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}
