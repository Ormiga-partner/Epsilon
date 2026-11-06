import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones generales que regulan la prestación de servicios de Epsilon Work a sus clientes.",
};

// Texto de la página "/legal/términos-y-condiciones" de Framer (los valores entre corchetes
// están así en el original y quedan pendientes de definir).
export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      updated="07 julio 2026"
      intro={
        <p>
          El presente documento consolida las condiciones generales que regulan
          la prestación de servicios de Epsilon Work a sus clientes, según
          órdenes de compra, estados de pago, contratos específicos o anexos
          técnicos que correspondan.
        </p>
      }
      sections={[
        {
          title: "Definiciones y partes contratantes",
          body: (
            <p>
              El presente documento regula los términos y condiciones aplicables
              a la prestación de servicios de ingeniería, construcción, obras
              civiles y telecomunicaciones provistos por Epsilon Work (en
              adelante, “la Empresa”), a favor de sus clientes (en adelante, “el
              Cliente”). Cualquier orden de compra, estado de pago o contrato
              específico se entenderá integrado por estos términos.
            </p>
          ),
        },
        {
          title: "Objeto y alcance de los servicios",
          body: (
            <>
              <p>
                Epsilon Work se compromete a prestar soluciones integrales de
                ingeniería y telecomunicaciones según los requerimientos
                técnicos acordados mutuamente. El alcance detallado de las
                actividades incluirá de forma enunciativa pero no limitativa:
              </p>
              <ul>
                <li>
                  Mantención, traslado y construcción de redes de fibra óptica
                  (F.O.), HFC, FTTH y DTH.
                </li>
                <li>
                  Ingeniería, diseño de planta externa y sistemas de CCTV.
                </li>
                <li>
                  Construcción e implementación de sitios móviles y fijos
                  (torres, monopostes, nodos PIX).
                </li>
                <li>
                  Instalación, desconexión y retiro de equipamiento domiciliario
                  y corporativo (Última Milla).
                </li>
                <li>
                  Obras civiles asociadas (canalizaciones, instalación de
                  postes, soterramientos, cámaras y adosamientos).
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Ejecución, niveles de servicio (SLA) y KPIs",
          body: (
            <ul>
              <li>
                <strong>Cumplimiento técnico:</strong> los servicios se
                ejecutarán bajo estrictos estándares de calidad y con la
                administración eficiente de recursos comprometida por la
                Empresa.
              </li>
              <li>
                <strong>Acuerdos de Nivel de Servicio (SLA):</strong> cuando el
                proyecto lo requiera (por ejemplo, atención de incidencias
                críticas de red), los tiempos de respuesta y solución se regirán
                por los KPIs y SLAs específicos detallados en el anexo técnico
                del contrato o la orden de servicio.
              </li>
              <li>
                <strong>Fuerza mayor:</strong> la Empresa no será responsable
                por retrasos derivados de condiciones climáticas extremas, falta
                de permisos municipales/gubernamentales ajenos a su gestión, o
                fuerza mayor.
              </li>
            </ul>
          ),
        },
        {
          title: "Obligaciones en prevención de riesgos y seguridad laboral",
          body: (
            <>
              <p>
                En concordancia con los altos estándares de la Empresa y la
                normativa legal vigente en Chile (Ley 16.744 y decretos
                complementarios):
              </p>
              <ul>
                <li>
                  Epsilon Work garantiza que todo su personal en terreno cuenta
                  con los Elementos de Protección Personal (EPP) obligatorios y
                  la inducción de seguridad correspondiente.
                </li>
                <li>
                  Las partes se comprometen a respetar los protocolos de
                  Seguridad Laboral específicos exigidos tanto en la minería,
                  energía, como en la vía pública o predios privados de las
                  operadoras.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Condiciones comerciales, tarifas y pagos",
          body: (
            <ul>
              <li>
                <strong>Precios:</strong> los servicios se facturarán de acuerdo
                con los valores unitarios (baremos), hitos de proyectos “llave
                en mano” o presupuestos aprobados previamente por escrito
                mediante Orden de Compra.
              </li>
              <li>
                <strong>Facturación:</strong> las facturas se emitirán de forma
                [mensual / por hito de avance], previa aprobación del Estado de
                Pago por parte del supervisor designado por el Cliente.
              </li>
              <li>
                <strong>Plazo de pago:</strong> los pagos deberán ser efectuados
                dentro de los [30 / 60] días corridos contados desde la fecha de
                recepción de la factura, mediante transferencia electrónica a la
                cuenta corriente de la Empresa.
              </li>
            </ul>
          ),
        },
        {
          title: "Confidencialidad y propiedad intelectual",
          body: (
            <ul>
              <li>
                <strong>Información confidencial:</strong> ambas partes se
                obligan a mantener estricta reserva sobre toda la información
                técnica, comercial, planos de planta externa, diagramas de red o
                datos de clientes finales a los que tengan acceso durante la
                vigencia de la relación comercial.
              </li>
              <li>
                <strong>Propiedad intelectual:</strong> los diseños, ingenierías
                preliminares, metodologías de trabajo o softwares utilizados por
                Epsilon Work para la ejecución del servicio son de su exclusiva
                propiedad intelectual.
              </li>
            </ul>
          ),
        },
        {
          title: "Responsabilidad y garantías de la obra",
          body: (
            <ul>
              <li>
                <strong>Garantía técnica:</strong> Epsilon Work garantiza la
                correcta ejecución de las obras y canalizaciones civiles por un
                período de [6 meses / 1 año] contra defectos de instalación o
                vicios de construcción, contados desde el Acta de Recepción
                Conforme.
              </li>
              <li>
                <strong>Exclusiones:</strong> la garantía no cubrirá daños
                causados por vandalismo, cortes de terceros ajenos a la Empresa,
                manipulaciones no autorizadas del equipamiento o desgaste
                natural de los materiales proporcionados por el Cliente (ZTE,
                Claro, WOM, etc.).
              </li>
            </ul>
          ),
        },
        {
          title: "Legislación aplicable y jurisdicción",
          body: (
            <p>
              Los presentes Términos y Condiciones se rigen por las leyes de la
              República de Chile. Para cualquier controversia o diferencia
              derivada de la interpretación o cumplimiento de este documento,
              las partes fijan su domicilio en la ciudad de Santiago de Chile y
              se someten a la jurisdicción de sus Tribunales Ordinarios de
              Justicia.
            </p>
          ),
        },
      ]}
    />
  );
}
