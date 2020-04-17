export default {
  title: "Prosjekt",
  name: "project",
  type: "document",
  fields: [
    {
      title: "Eier",
      name: "owner",
      type: "reference",
      to: [{type: "adminUser"}]
    },
    {
      title: "Navn",
      name: "name",
      type: "string",
    },
    {
      title: "Hjelpefil",
      name: "helprecording",
      type: "file"
    },
    {
      title: "Bildeserie",
      name: "images",
      type: "array",
      of: [{type: "image"}]
    }
  ]
};
