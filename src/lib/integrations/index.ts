export type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
export {
  exchangeAdapters,
  getAdapterById,
  detectAdapter,
} from "@/lib/integrations/registry";
export {
  importExchangeCsv,
  type ImportExchangeCsvOptions,
  type ImportExchangeCsvResult,
} from "@/lib/integrations/import-exchange-csv";
