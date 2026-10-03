import { Modding } from "@flamework/core";
import type { SystemPhase } from "./scheduler";
export interface SystemOptions { category?: string; phase?: SystemPhase; name?: string }
export const System = Modding.createMetaDecorator<[options?: SystemOptions]>("Class");
