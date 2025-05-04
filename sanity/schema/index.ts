import {type SchemaTypeDefinition} from "sanity";

import {blockContent} from "./common/blockContent";
import {settings} from "./settings";
import {intermediaries} from "./settings/intermediaries";
import {home} from "./home";
import {transactions} from "./transactions";

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [blockContent, settings, home, intermediaries, transactions],
};
