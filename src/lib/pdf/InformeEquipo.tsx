import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a2e",
  },
  border: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    padding: 25,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#3AB6B6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#486084",
  },
  headerSubtitle: {
    fontSize: 7,
    color: "#888",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerRightText: {
    fontSize: 8,
    color: "#888",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#486084",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 110,
    color: "#888",
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: "#1a1a2e",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 2,
  },
  box: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    marginTop: 6,
  },
  boxTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#486084",
    marginBottom: 4,
  },
  boxText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#1a1a2e",
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableHeaderCell: {
    padding: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#486084",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    color: "#1a1a2e",
  },
  tableCellCenter: {
    padding: 6,
    fontSize: 8,
    textAlign: "center",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  photoWrapper: {
    width: 120,
    height: 90,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  firma: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  firmaBox: {
    alignItems: "center",
    width: 150,
  },
  firmaLine: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: "#1a1a2e",
    marginBottom: 4,
  },
  firmaText: {
    fontSize: 8,
    color: "#888",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#aaa",
  },
});

interface CheckItem {
  nombre: string;
  categoria: string;
  resultado: "ok" | "falla" | "na";
  observacion?: string;
}

interface InformeEquipoProps {
  logoBase64?: string | null;
  logoClienteBase64?: string | null;
  equipo: {
    nombre: string;
    id_cliente?: string | null;
    tipo: string;
    marca?: string | null;
    modelo?: string | null;
    serie: string;
    accesorios?: string | null;
    ubicacion: string;
  };
  cliente: {
    nombre: string;
    nit?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    email: string;
  };
  mantenimiento: {
    tipo: string;
    fecha: string;
    orden_servicio?: string;
    numero_informe?: string;
    observaciones?: string;
    conclusion?: string;
    tecnico_nombre: string;
    aprobador_nombre?: string;
    firma_tecnico?: string;
    firma_aprobador?: string;
    firma_recibe?: string;
    checklist?: CheckItem[];
    fotos?: string[];
  };
  fechaActual: string;
}

function resultadoLabel(r: string) {
  if (r === "ok") return "OK";
  if (r === "falla") return "FALLA";
  return "N/A";
}

function resultadoColor(r: string) {
  if (r === "ok") return "#16a34a";
  if (r === "falla") return "#dc2626";
  return "#a1a1aa";
}

function ContentBlock({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View wrap={false} style={style}>{children}</View>;
}

export function InformeEquipo({
  logoBase64,
  logoClienteBase64,
  equipo,
  cliente,
  mantenimiento,
  fechaActual,
}: InformeEquipoProps) {
  const hasFotos = mantenimiento.fotos && mantenimiento.fotos.length > 0;
  const hasChecklist = mantenimiento.checklist && mantenimiento.checklist.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoBase64 && <Image style={styles.logo} src={logoBase64} />}
              <View>
                <Text style={styles.headerTitle}>GESTEK</Text>
                <Text style={styles.headerSubtitle}>Gestión de Equipos Biomédicos</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerRightText}>Informe de servicio</Text>
              {logoClienteBase64 ? (
                <Image style={{ width: 80, height: 40, objectFit: "contain" }} src={logoClienteBase64} />
              ) : (
                <Text style={styles.headerRightText}>Cliente: {cliente.nombre}</Text>
              )}
            </View>
          </View>

          {/* Datos del cliente */}
          <ContentBlock style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del cliente</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>{cliente.nombre}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>NIT:</Text>
                  <Text style={styles.value}>{cliente.nit || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Dirección:</Text>
                  <Text style={styles.value}>{cliente.direccion || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Ciudad:</Text>
                  <Text style={styles.value}>{cliente.ciudad || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{cliente.email || "—"}</Text>
                </View>
              </View>
            </View>
          </ContentBlock>

          {/* Datos del equipo */}
          <ContentBlock style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del equipo</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>{equipo.nombre}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>ID cliente:</Text>
                  <Text style={styles.value}>{equipo.id_cliente || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Tipo:</Text>
                  <Text style={styles.value}>{equipo.tipo}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Serie:</Text>
                  <Text style={styles.value}>{equipo.serie}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Marca:</Text>
                  <Text style={styles.value}>{equipo.marca || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Modelo:</Text>
                  <Text style={styles.value}>{equipo.modelo || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Ubicación:</Text>
                  <Text style={styles.value}>{equipo.ubicacion}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Accesorios:</Text>
                  <Text style={styles.value}>{equipo.accesorios || "—"}</Text>
                </View>
              </View>
            </View>
          </ContentBlock>

          {/* Servicio realizado */}
          <ContentBlock style={styles.section}>
            <Text style={styles.sectionTitle}>Servicio realizado</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Tipo:</Text>
                  <Text style={styles.value}>{mantenimiento.tipo}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Fecha:</Text>
                  <Text style={styles.value}>{mantenimiento.fecha}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Profesional:</Text>
                  <Text style={styles.value}>{mantenimiento.tecnico_nombre}</Text>
                </View>
              </View>
              {mantenimiento.orden_servicio && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Orden de servicio:</Text>
                    <Text style={styles.value}>{mantenimiento.orden_servicio}</Text>
                  </View>
                </View>
              )}
              {mantenimiento.numero_informe && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>N° de informe:</Text>
                    <Text style={styles.value}>{mantenimiento.numero_informe}</Text>
                  </View>
                </View>
              )}
            </View>
          </ContentBlock>

          {/* Observaciones */}
          {mantenimiento.observaciones && (
            <ContentBlock style={styles.section}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <View style={styles.box}>
                <Text style={styles.boxText}>{mantenimiento.observaciones}</Text>
              </View>
            </ContentBlock>
          )}

          {/* Checklist */}
          {hasChecklist && (
            <ContentBlock style={styles.section}>
              <Text style={styles.sectionTitle}>Lista de chequeo</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { width: "40%" }]}>Ítem</Text>
                  <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Categoría</Text>
                  <Text style={[styles.tableHeaderCell, { width: "12%", textAlign: "center" }]}>Resultado</Text>
                  <Text style={[styles.tableHeaderCell, { width: "28%" }]}>Observación</Text>
                </View>
                {mantenimiento.checklist!.map((item, i) => (
                  <View key={i} style={[styles.tableRow, i % 2 === 0 ? { backgroundColor: "#fafafa" } : undefined] as any}>
                    <Text style={[styles.tableCell, { width: "40%" }]}>{item.nombre}</Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>{item.categoria}</Text>
                    <Text style={[styles.tableCellCenter, { width: "12%", color: resultadoColor(item.resultado) }]}>
                      {resultadoLabel(item.resultado)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "28%" }]}>{item.observacion || "—"}</Text>
                  </View>
                ))}
              </View>
            </ContentBlock>
          )}

          {/* Conclusión */}
          {mantenimiento.conclusion && (
            <ContentBlock style={styles.section}>
              <Text style={styles.sectionTitle}>Conclusión</Text>
              <View style={styles.box}>
                <Text style={styles.boxText}>{mantenimiento.conclusion}</Text>
              </View>
            </ContentBlock>
          )}

          {/* Evidencia fotográfica */}
          {hasFotos && (
            <ContentBlock style={styles.section}>
              <Text style={styles.sectionTitle}>Evidencia fotográfica</Text>
              <View style={styles.photoGrid}>
                {mantenimiento.fotos!.slice(0, 6).map((url, i) => (
                  <View key={i} style={styles.photoWrapper}>
                    <Image style={styles.photo} src={url} />
                  </View>
                ))}
              </View>
              {mantenimiento.fotos!.length > 6 && (
                <Text style={{ fontSize: 7, color: "#aaa", marginTop: 4 }}>
                  + {mantenimiento.fotos!.length - 6} foto(s) adicional(es)
                </Text>
              )}
            </ContentBlock>
          )}

          {/* Firmas */}
          <ContentBlock style={styles.firma}>
            <View style={styles.firmaBox}>
              {mantenimiento.firma_tecnico ? (
                <Image style={{ width: 120, height: 50, objectFit: "contain", marginBottom: 4 }} src={mantenimiento.firma_tecnico} />
              ) : (
                <View style={styles.firmaLine} />
              )}
              <Text style={styles.firmaText}>Firma del profesional que ejecuta</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{mantenimiento.tecnico_nombre}</Text>
            </View>
            <View style={styles.firmaBox}>
              {mantenimiento.firma_aprobador ? (
                <Image style={{ width: 120, height: 50, objectFit: "contain", marginBottom: 4 }} src={mantenimiento.firma_aprobador} />
              ) : (
                <View style={styles.firmaLine} />
              )}
              <Text style={styles.firmaText}>Firma del profesional que aprueba</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{mantenimiento.aprobador_nombre || ""}</Text>
            </View>
            <View style={styles.firmaBox}>
              {mantenimiento.firma_recibe ? (
                <Image style={{ width: 120, height: 50, objectFit: "contain", marginBottom: 4 }} src={mantenimiento.firma_recibe} />
              ) : (
                <View style={styles.firmaLine} />
              )}
              <Text style={styles.firmaText}>Firma de quien recibe a satisfacción</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{cliente.nombre}</Text>
            </View>
          </ContentBlock>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>GESTEK — Sistema de Gestión de Equipos Biomédicos</Text>
          <Text>Generado: {fechaActual} · {cliente.nombre}</Text>
        </View>
      </Page>
    </Document>
  );
}