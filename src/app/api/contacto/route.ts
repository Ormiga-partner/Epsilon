// Envío del formulario de contacto con Cloudflare Email (binding "send_email" del Worker,
// configurado en wrangler.jsonc). En Framer: destino contacto@epsilonwork.cl, asunto "Nuevo mensaje".
// Requisitos en Cloudflare: Email Routing activo en epsilonwork.cl y contacto@epsilonwork.cl
// verificado como dirección de destino. El remitente (CONTACT_FROM) debe ser del mismo dominio.

import { getCloudflareContext } from "@opennextjs/cloudflare";

type SendEmail = {
  send(message: {
    from: string | { email: string; name?: string };
    to: string | string[];
    subject: string;
    replyTo?: string;
    text?: string;
    html?: string;
  }): Promise<{ messageId: string }>;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  const get = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, 5000) : "");
  const data = { Nombre: get("Name"), Correo: get("Email"), Empresa: get("Empresa"), Solicitud: get("Solicitud") };
  if (!data.Nombre || !data.Empresa || !data.Solicitud || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Correo)) {
    return Response.json({ error: "Faltan campos" }, { status: 422 });
  }
  // Ley 21.719: sin consentimiento expreso no se tratan los datos
  if (get("consentimiento") !== "si") {
    return Response.json({ error: "Falta el consentimiento" }, { status: 422 });
  }
  // Registro del consentimiento (prueba: qué se aceptó, cuándo y qué versión de la política)
  const consent = {
    "Consentimiento tratamiento": `Sí (${new Date().toISOString()})`,
    "Política aceptada": get("politica") || "sin versión",
    "Comunicaciones comerciales": get("comerciales") === "si" ? "Sí" : "No",
  };

  let env: { SEND_EMAIL?: SendEmail; CONTACT_TO?: string; CONTACT_FROM?: string };
  try {
    env = (await getCloudflareContext({ async: true })).env as typeof env;
  } catch {
    env = {};
  }
  if (!env.SEND_EMAIL) {
    return Response.json({ error: "Envío de correo no configurado" }, { status: 503 });
  }

  const all = { ...data, ...consent };
  const html =
    "<p>Han recibido un nuevo mensaje desde el formulario de contacto.</p>" +
    Object.entries(all)
      .map(([k, v]) => `<p><strong>${k}:</strong><br>${esc(v).replace(/\n/g, "<br>")}</p>`)
      .join("");
  const text = Object.entries(all)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n\n");
  try {
    await env.SEND_EMAIL.send({
      from: { email: env.CONTACT_FROM || "web@epsilonwork.cl", name: "Web Epsilon Work" },
      to: env.CONTACT_TO || "contacto@epsilonwork.cl",
      replyTo: data.Correo,
      subject: "Nuevo mensaje",
      html,
      text,
    });
  } catch {
    return Response.json({ error: "No se pudo enviar" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
