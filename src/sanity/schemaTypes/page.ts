import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Página",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "URL", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "seoDescription", title: "Descripción SEO", type: "text", rows: 3 }),
    defineField({
      name: "body",
      title: "Contenido",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
  ],
});
