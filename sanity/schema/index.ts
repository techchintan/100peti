import {type SchemaTypeDefinition} from "sanity";

import {blockContent} from "./common/blockContent";
import {cashNotes} from "./cashNotes";
import {goldWealth} from "./goldWealth";
import {settings} from "./settings";
import {intermediaries} from "./settings/intermediaries";
import {home} from "./home";
import {tradingInvestment} from "./tradingInvestment";
import {transactions} from "./transactions";

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    blockContent,
    settings,
    home,
    intermediaries,
    transactions,
    cashNotes,
    tradingInvestment,
    goldWealth,
  ],
};
