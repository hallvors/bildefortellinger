export default {
  title: "Opptak",
  name: "recording",
  type: "document",
  fields: [
    {
      title: "Prosjekt",
      name: "project",
      type: "reference",
      to: [{type: "project"}]
    },
    {
      title: "Elev",
      name: "pupil",
      type: "string",
    },
    {
      title: "Kommentar",
      name: "comment",
      type: "string",
    },
    {
      title: "Opptak",
      name: "recording",
      type: "file"
    },
    {
      title: "Metadata",
      name: "meta",
      type: "array",
      of: [{
        type: "object", fields: [
          {
            title: "Bilde",
            name: "image",
            type: "number"
          },
          {
            title: "Tid",
            name: "timestamp",
            type: "number"
          }
      ]}]
    }
  ]
};
