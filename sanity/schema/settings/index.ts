import {defineField, defineType} from "sanity";

import {StudioIcons} from "@/sanity/studio/icons";

export const settings = defineType({
  title: "Site Settings",
  name: "settings",
  type: "document",
  icon: StudioIcons.settings,
  groups: [
    {name: "brand", title: "Brand", default: true},
    {name: "header", title: "Navigation"},
  ],
  fields: [
    defineField({
      name: "brand",
      title: "Brand",
      group: "brand",
      type: "object",
      fields: [
        defineField({
          name: "name",
          title: "Family / Site Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "header",
      title: "Header Navigation",
      group: "header",
      type: "object",
      fields: [
        defineField({
          name: "headerLinks",
          title: "Header Links",
          type: "array",
          of: [
            defineField({
              name: "headerLink",
              title: "Header Link",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "Label",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "link",
                  title: "Link",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "submenu",
                  title: "Submenu",
                  type: "array",
                  of: [
                    defineField({
                      name: "submenuItem",
                      title: "Submenu Item",
                      type: "object",
                      fields: [
                        defineField({
                          name: "label",
                          title: "Label",
                          type: "string",
                          validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                          name: "link",
                          title: "Link",
                          type: "string",
                          validation: (Rule) => Rule.required(),
                        }),
                      ],
                      preview: {
                        select: {title: "label", subtitle: "link"},
                      },
                    }),
                  ],
                }),
              ],
              preview: {
                select: {title: "label", subtitle: "link"},
              },
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {title: "brand.name"},
    prepare: ({title}) => ({
      title: title || "Site Settings",
      subtitle: "Navigation & branding",
      media: StudioIcons.settings,
    }),
  },
});
