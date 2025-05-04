import {defineField} from "sanity";

export const seo = defineField({
  name: "seo",
  title: "SEO",
  type: "object",
  group: "seo",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{type: "string"}],
    }),
    defineField({
      name: "canonical",
      title: "Canonical",
      type: "url",
    }),
  ],
});
