import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Descripción SEO", type: "text", rows: 3 }),
    defineField({ name: "ogImage", title: "Imagen para compartir", type: "image" }),
  ],
});
