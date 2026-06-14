import {defineField, defineType} from "sanity";
import {seo} from "@/sanity/fields/seo";
import {StudioIcons} from "@/sanity/studio/icons";

export const home = defineType({
  name: "home",
  title: "Home Page",
  type: "document",
  icon: StudioIcons.home,
  groups: [
    {name: "seo", title: "SEO"},
    {name: "content", title: "Content", default: true},
  ],
  fields: [
    seo,
    defineField({
      name: "tagline",
      title: "Tagline",
      group: "content",
      type: "string",
      description: "Short headline shown on the home page.",
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
      subtitle: "tagline",
    },
    prepare: ({title, subtitle}) => ({
      title: title || "Home Page",
      subtitle: subtitle || "Website content",
      media: StudioIcons.home,
    }),
  },
});
