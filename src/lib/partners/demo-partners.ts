import type { DemoPartner } from "@/lib/partners/partner-types";

export const demoPartners: DemoPartner[] = [
  {
    id: "exchanges",
    title: "Криптобиржи и P2P-сообщества",
    description:
      "Помогают пользователям перейти к локальной подготовке истории операций и отчета для проверки.",
    href: "/partners/exchanges",
  },
  {
    id: "accountants",
    title: "Бухгалтеры и налоговые консультанты",
    description:
      "Получают более структурированный контекст по операциям, пробелам в данных и вопросам к клиенту.",
    href: "/partners/accountants",
  },
  {
    id: "education",
    title: "Крипто-образование и OTC",
    description:
      "Могут направлять пользователей в локальный MVP-импорт с partner tag без серверного трекинга.",
    href: "/partners",
  },
];
