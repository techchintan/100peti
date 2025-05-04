import {defineField, defineType} from "sanity";

export const settings = defineType({
  title: "Settings",
  name: "settings",
  type: "document",
  groups: [
    {
      name: "brand",
      title: "Brand",
    },
    {
      name: "header",
      title: "Header",
    },
    {
      name: "footer",
      title: "Footer",
    },
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
          title: "Name",
          type: "string",
        }),
        defineField({
          name: "logo",
          title: "Logo",
          type: "image",
        }),
      ],
    }),
    defineField({
      name: "header",
      title: "Header",
      group: "header",
      type: "object",
      fields: [
        defineField({
          name: "headerLinks",
          title: "Header Links",
          type: "array",
          of: [
            defineField({
              name: "link",
              title: "Link",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "Label",
                  type: "string",
                }),
                defineField({
                  name: "link",
                  title: "Link",
                  type: "string",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      group: "footer",
      type: "object",
      fields: [
        defineField({
          name: "socialLinks",
          title: "Social Links",
          type: "array",
          of: [
            defineField({
              name: "link",
              title: "Link",
              type: "object",
              fields: [
                defineField({
                  name: "icon",
                  title: "Icon",
                  type: "image",
                }),
                defineField({
                  name: "label",
                  title: "Label",
                  type: "string",
                }),
                defineField({
                  name: "link",
                  title: "Link",
                  type: "url",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "brand.name",
      media: "brand.logo",
    },
  },
});
