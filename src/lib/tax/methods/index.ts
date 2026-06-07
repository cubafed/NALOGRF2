import type { CostBasisMethod } from "@/lib/tax/engine/engine-types";
import { fifoMethod } from "@/lib/tax/methods/fifo";
import { lifoMethod } from "@/lib/tax/methods/lifo";
import { hifoMethod } from "@/lib/tax/methods/hifo";
import { acbMethod } from "@/lib/tax/methods/acb";

export { fifoMethod } from "@/lib/tax/methods/fifo";
export { lifoMethod } from "@/lib/tax/methods/lifo";
export { hifoMethod } from "@/lib/tax/methods/hifo";
export { acbMethod } from "@/lib/tax/methods/acb";

export type CostBasisMethodId = "fifo" | "lifo" | "hifo" | "acb";

/** All available cost-basis methods, keyed by id. FIFO is the default. */
export const costBasisMethods: Record<CostBasisMethodId, CostBasisMethod> = {
  fifo: fifoMethod,
  lifo: lifoMethod,
  hifo: hifoMethod,
  acb: acbMethod,
};

/** Look up a cost-basis method by id; returns null for unknown ids. */
export function getCostBasisMethod(id: string): CostBasisMethod | null {
  return costBasisMethods[id as CostBasisMethodId] ?? null;
}
