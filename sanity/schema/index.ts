import {type SchemaTypeDefinition} from "sanity";

import {blockContent} from "./common/blockContent";
import {settings} from "./settings";
import {home} from "./home";

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [blockContent, settings, home],
};
