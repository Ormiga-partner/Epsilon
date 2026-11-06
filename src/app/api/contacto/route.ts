// Envío del formulario de contacto por correo (en Framer: destino email contacto@epsilonwork.cl,
// asunto "Nuevo mensaje"). Usa la API de Resend; requiere RESEND_API_KEY y CONTACT_FROM
// (remitente de un dominio verificado en Resend). CONTACT_TO opcional.

const TO = process.env.CONTACT_TO || "contacto@epsilonwork.cl";

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

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!key || !from) {
    return Response.json({ error: "Envío de correo no configurado" }, { status: 503 });
  }

  const rows = Object.entries(data)
    .map(([k, v]) => `<p><strong>${k}:</strong><br>${esc(v).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [TO],
      reply_to: data.Correo,
      subject: "Nuevo mensaje",
      html: `<p>Han recibido un nuevo mensaje desde el formulario de contacto.</p>${rows}`,
    }),
  });
  if (!res.ok) return Response.json({ error: "No se pudo enviar" }, { status: 502 });
  return Response.json({ ok: true });
}
