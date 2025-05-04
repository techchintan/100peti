import {defineField, defineType} from "sanity";
import {seo} from "@/sanity/fields/seo";

export const home = defineType({
  name: "home",
  title: "Home Page",
  type: "document",
  groups: [
    {name: "seo", title: "SEO"},
    {name: "content", title: "Content"},
  ],
  fields: [
    seo,
    defineField({
      name: "tagline",
      title: "Tagline",
      group: "content",
      type: "string",
    }),
    defineField({
      name: "about",
      title: "About",
      group: "content",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "seo.metaTitle",
      subtitle: "seo.metaDescription",
    },
  },
});
