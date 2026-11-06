import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Políticas de privacidad",
  description:
    "Cómo Epsilon Work SPA trata tus datos personales conforme a la Ley N° 19.628 y la Ley N° 21.719.",
};

// Texto de la página "/legal/políticas-de-privacidad" de Framer, actualizado a este sitio:
// proveedores (Cloudflare en lugar de Framer, más Google Analytics con consentimiento de cookies),
// campo "Solicitud" y registro de consentimiento, y correo de contacto unificado.
const MAIL = "contacto@epsilonwork.cl";

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Políticas de privacidad"
      updated="6 noviembre 2026"
      intro={
        <p>
          En Epsilon Work SPA (RUT 77.648.836-4, en adelante “Epsilon Work”,
          “nosotros”) nos comprometemos a proteger tus datos personales. Esta
          política explica qué datos recopilamos a través de este sitio web, con
          qué finalidad, cómo los tratamos y qué derechos tienes sobre ellos,
          conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y su
          reforma introducida por la Ley N° 21.719 sobre Protección de Datos
          Personales.
        </p>
      }
      sections={[
        {
          title: "Responsable del tratamiento",
          body: (
            <>
              <p>El responsable del tratamiento de tus datos es:</p>
              <ul>
                <li>
                  <strong>Razón social:</strong> Epsilon Work SPA
                </li>
                <li>
                  <strong>RUT:</strong> 77.648.836-4
                </li>
                <li>
                  <strong>Domicilio:</strong> Av. Presidente Kennedy 5488, Of.
                  201, Ed. A, Vitacura.
                </li>
                <li>
                  <strong>Correo:</strong>{" "}
                  <a href="mailto:aline.cortez@pytsystems.cl">
                    aline.cortez@pytsystems.cl
                  </a>
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Datos que recopilamos",
          body: (
            <>
              <p>
                Recopilamos únicamente los datos que nos entregas de forma
                voluntaria al completar nuestro formulario de contacto para
                solicitar una cotización o agendar una evaluación de proyecto:
              </p>
              <ul>
                <li>Nombre completo</li>
                <li>Correo</li>
                <li>Empresa</li>
                <li>El detalle de tu solicitud</li>
              </ul>
              <p>
                Además registramos la fecha y hora en que otorgas tu
                consentimiento, la versión de esta política que aceptaste y si
                autorizaste o no el envío de comunicaciones comerciales.
              </p>
            </>
          ),
        },
        {
          title: "Finalidad del tratamiento",
          body: (
            <>
              <p>Utilizamos tus datos exclusivamente para:</p>
              <ul>
                <li>Responder a tus solicitudes de cotización.</li>
                <li>
                  Contactarte en relación con la consulta que nos hiciste.
                </li>
                <li>
                  Enviarte información comercial, solo si lo autorizaste
                  expresamente en el formulario.
                </li>
              </ul>
              <p>
                No utilizamos tus datos para fines distintos a los aquí
                indicados ni los cedemos a terceros con fines comerciales.
              </p>
            </>
          ),
        },
        {
          title: "Base de licitud",
          body: (
            <p>
              El tratamiento se realiza sobre la base de tu consentimiento,
              otorgado al marcar la casilla correspondiente y enviar el
              formulario, y de las gestiones precontractuales necesarias para
              atender tu solicitud. Puedes retirar tu consentimiento en
              cualquier momento escribiéndonos a{" "}
              <a href={`mailto:${MAIL}`}>{MAIL}</a>.
            </p>
          ),
        },
        {
          title: "Destinatarios y encargados de tratamiento",
          body: (
            <>
              <p>
                Los datos enviados a través del formulario se remiten al correo{" "}
                <a href={`mailto:${MAIL}`}>{MAIL}</a> y son tratados por nuestro
                equipo interno.
              </p>
              <p>
                Para operar el sitio y sus servicios utilizamos proveedores que
                actúan como encargados de tratamiento:
              </p>
              <ul>
                <li>
                  <strong>Cloudflare:</strong> alojamiento y operación del sitio
                  web, y envío por correo de los mensajes del formulario
                  (Cloudflare Email).
                </li>
                <li>
                  <strong>Google:</strong> Google Analytics, analítica de uso
                  del sitio, solo si aceptas las cookies de analítica.
                </li>
              </ul>
              <p>
                Estos proveedores pueden almacenar información en servidores
                ubicados fuera de Chile, por lo que el tratamiento puede
                implicar una transferencia internacional de datos. Seleccionamos
                proveedores que ofrecen garantías adecuadas de protección
                conforme a la normativa vigente.
              </p>
            </>
          ),
        },
        {
          title: "Cookies y analítica",
          body: (
            <>
              <p>
                Este sitio utiliza Google Analytics para medir y analizar de
                forma agregada el uso de la página mediante cookies, lo que nos
                permite mejorar la experiencia del sitio. Estas cookies{" "}
                <strong>solo se activan si las aceptas</strong> en el aviso de
                cookies; si las rechazas, Google Analytics no se carga.
              </p>
              <ul>
                <li>
                  <strong>_ga:</strong> distingue visitantes de forma seudónima.
                  Duración: hasta 2 años.
                </li>
                <li>
                  <strong>_ga_&lt;ID&gt;:</strong> mantiene el estado de la
                  sesión. Duración: hasta 2 años.
                </li>
              </ul>
              <p>
                Además, el sitio guarda en tu navegador datos técnicos
                necesarios que no te identifican: tu decisión sobre las cookies
                y si ya viste la animación de carga en esta visita.
              </p>
              <p>
                Puedes cambiar o retirar tu consentimiento en cualquier momento
                desde el enlace “Configuración de cookies” al pie del sitio, o
                bloquear y eliminar cookies desde la configuración de tu
                navegador.
              </p>
            </>
          ),
        },
        {
          title: "Conservación de los datos",
          body: (
            <p>
              Conservamos tus datos durante 6 meses o hasta que solicites su
              eliminación, salvo obligación legal de conservarlos por un período
              mayor.
            </p>
          ),
        },
        {
          title: "Tus derechos",
          body: (
            <>
              <p>
                Como titular de los datos, la ley te reconoce los derechos de:
              </p>
              <ul>
                <li>
                  <strong>Acceso:</strong> conocer qué datos tuyos tratamos.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos inexactos o
                  desactualizados.
                </li>
                <li>
                  <strong>Supresión (cancelación):</strong> solicitar la
                  eliminación de tus datos.
                </li>
                <li>
                  <strong>Oposición:</strong> oponerte a determinados
                  tratamientos.
                </li>
                <li>
                  <strong>Portabilidad:</strong> recibir tus datos en un formato
                  estructurado y de uso común.
                </li>
                <li>
                  <strong>Bloqueo:</strong> suspender temporalmente el
                  tratamiento.
                </li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, escríbenos a{" "}
                <a href={`mailto:${MAIL}`}>{MAIL}</a>. Responderemos tu
                solicitud en los plazos que establece la ley.
              </p>
              <p>
                Si consideras que tu solicitud no fue atendida adecuadamente,
                tienes derecho a reclamar ante la Agencia de Protección de Datos
                Personales.
              </p>
            </>
          ),
        },
        {
          title: "Seguridad",
          body: (
            <p>
              Aplicamos medidas técnicas y organizativas razonables para
              proteger tus datos frente a accesos no autorizados, pérdida o
              alteración. En caso de una vulneración que afecte tus datos
              personales, notificaremos a la autoridad y, cuando corresponda, a
              los titulares afectados, conforme a la ley.
            </p>
          ),
        },
        {
          title: "Cambios a esta política",
          body: (
            <p>
              Podemos actualizar esta política en cualquier momento. La versión
              vigente será siempre la publicada en este sitio, con su fecha de
              última actualización.
            </p>
          ),
        },
      ]}
    />
  );
}
