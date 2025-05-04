import {type SchemaTypeDefinition} from "sanity";

import {blockContent} from "./common/blockContent";
import {category} from "./blog/category";
import {post} from "./blog/post";
import {author} from "./blog/author";
import {settings} from "./settings";
import {home} from "./home";

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [blockContent, category, post, author, settings, home],
};
