"use client";

import {visionTool} from "@sanity/vision";
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";

import {apiVersion, dataset, projectId} from "./sanity/env";
import {schema} from "./sanity/schema";
import {structure} from "./sanity/structure";
import {codeInput} from "@sanity/code-input";

const singletonActions = new Set<string>(["publish", "discardChanges", "restore"]);

const singletonTypes = new Set<string>([]);

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion}), codeInput()],
  document: {
    // For singleton types, filter out actions that are not explicitly included
    // in the `singletonActions` list defined above
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && singletonActions.has(action))
        : input,
  },
});
