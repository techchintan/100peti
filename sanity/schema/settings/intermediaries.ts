import {defineField, defineType} from "sanity";

import {StudioIcons} from "@/sanity/studio/icons";

export const intermediaries = defineType({
  title: "Intermediaries",
  name: "intermediaries",
  type: "document",
  icon: StudioIcons.people,
  groups: [
    {name: "details", title: "Details", default: true},
    {name: "bank", title: "Bank Details"},
  ],
  orderings: [
    {
      title: "Name A–Z",
      name: "nameAsc",
      by: [{field: "name", direction: "asc"}],
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      group: "details",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relationship",
      title: "Relationship",
      group: "details",
      type: "string",
      description: "e.g. Family, Friend, Business",
    }),
    defineField({
      name: "mobileNumber",
      title: "Mobile Number",
      group: "details",
      type: "string",
    }),
    defineField({
      name: "bankName",
      title: "Bank Name",
      group: "bank",
      type: "string",
    }),
    defineField({
      name: "accountNumber",
      title: "Account Number",
      group: "bank",
      type: "string",
      validation: (Rule) => Rule.regex(/^\d*$/, {name: "digits only"}).warning(),
    }),
    defineField({
      name: "ifscCode",
      title: "IFSC Code",
      group: "bank",
      type: "string",
    }),
    defineField({
      name: "swiftCode",
      title: "SWIFT Code",
      group: "bank",
      type: "string",
    }),
    defineField({
      name: "bankLocation",
      title: "Bank Branch / Location",
      group: "bank",
      type: "string",
    }),
  ],
  preview: {
    select: {
      name: "name",
      relationship: "relationship",
      mobileNumber: "mobileNumber",
      bankName: "bankName",
    },
    prepare: ({name, relationship, mobileNumber, bankName}) => ({
      title: name || "Unnamed person",
      subtitle: [relationship, mobileNumber, bankName].filter(Boolean).join(" · ") || "No details",
      media: StudioIcons.people,
    }),
  },
});
