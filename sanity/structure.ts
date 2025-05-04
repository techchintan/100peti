import {CogIcon, HomeIcon, DocumentsIcon, WrenchIcon} from "@sanity/icons";
import type {StructureResolver} from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Portfolio")
    .items([
      S.listItem()
        .title("Pages")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .id("home")
                .icon(HomeIcon)
                .schemaType("home")
                .title("Home Page")
                .child(S.editor().id("home").schemaType("home").documentId("home")),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Utilities")
        .icon(WrenchIcon)
        .child(
          S.list()
            .title("Utilities")
            .items([
              S.listItem()
                .id("settings")
                .icon(CogIcon)
                .schemaType("settings")
                .title("Settings")
                .child(S.editor().id("settings").schemaType("settings").documentId("settings")),
            ]),
        ),
    ]);
