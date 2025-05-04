import {defineField, defineType} from "sanity";

export const intermediaries = defineType({
  title: "Intermediaries",
  name: "intermediaries",
  type: "document",
  groups: [
    {
      name: "details",
      title: "Details",
    },
    {
      name: "bank",
      title: "Bank",
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      group: "details",
      type: "string",
    }),
    defineField({
      name: "mobileNumber",
      title: "Mobile Number",
      group: "details",
      type: "string",
    }),
    defineField({
      name: "relationship",
      title: "Relationship",
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
      type: "number",
    }),
    defineField({
      name: "ifscCode",
      title: "IFSC Code",
      group: "bank",
      type: "string",
    }),
    defineField({
      name: "swiftCode",
      title: "Swift Code",
      group: "bank",
      type: "string",
    }),
    defineField({
      name: "bankLocation",
      title: "Bank Location",
      group: "bank",
      type: "string",
    }),
  ],
  preview: {
    select: {
      name: "name",
      relationship: "relationship",
      mobileNumber: "mobileNumber",
    },
    prepare: (value) => {
      return {
        title: value.name || "Unnamed Intermediary",
        subtitle: `${value.relationship} - ${value.mobileNumber}` || "No relationship specified",
      };
    },
  },
});
