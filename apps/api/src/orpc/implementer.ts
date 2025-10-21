import { implement } from "@orpc/server";
import { type AppContext, contract } from "./contract.js";

export const implementer = implement(contract).$context<AppContext>();
