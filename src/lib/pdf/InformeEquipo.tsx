import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { normalizeResultados } from "@/lib/checklist";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingTop: 15,
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
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3AB6B6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: "contain",
  },
  logoCliente: {
    width: 55,
    height: 55,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#486084",
  },
  headerSubtitle: {
    fontSize: 6.5,
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
    alignItems: "flex-start",
  },
  firmaBox: {
    alignItems: "center",
    width: 150,
  },
  firmaImageArea: {
    width: 120,
    height: 50,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  firmaLine: {
    width: 120,
    borderTopWidth: 1,
    borderTopColor: "#1a1a2e",
  },
  firmaText: {
    fontSize: 8,
    color: "#888",
  },
  checklistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  checklistItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 10,
  },
  checklistBox: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: "#6b7280",
    borderRadius: 2,
    marginRight: 6,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  checkIcon: {
    width: 11,
    height: 11,
    position: "relative",
  },
  checkStrokeA: {
    position: "absolute",
    left: 2,
    top: 6.5,
    width: 3,
    height: 1.5,
    backgroundColor: "#3AB6B6",
    transform: "rotate(45deg)",
  },
  checkStrokeB: {
    position: "absolute",
    left: 3.5,
    top: 4.5,
    width: 7,
    height: 1.5,
    backgroundColor: "#3AB6B6",
    transform: "rotate(-45deg)",
  },
  checklistTextWrap: {
    flex: 1,
  },
  checklistText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#1a1a2e",
  },
  checklistObs: {
    fontSize: 7.5,
    lineHeight: 1.4,
    color: "#888",
    fontStyle: "italic",
    marginTop: 1,
  },
});

interface InformeEquipoProps {
  logoBase64?: string | null;
  logoClienteBase64?: string | null;
  equipo: {
    id_cliente?: string | null;
    nombre: string;
    tipo: string;
    marca?: string | null;
    modelo?: string | null;
    serie: string;
    accesorios?: string | null;
    ubicacion: string;
    fecha_proximo_mantenimiento?: string | null;
  };
  cliente: {
    nombre: string;
    nit?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    email: string;
  };
  sede?: {
    nombre?: string;
    ciudad?: string | null;
    direccion?: string | null;
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
    checklist?: unknown;
    fotos?: string[];
  };
}

function ContentBlock({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View wrap={false} style={style}>{children}</View>;
}

function CheckIcon() {
  return (
    <View style={styles.checkIcon}>
      <View style={styles.checkStrokeA} />
      <View style={styles.checkStrokeB} />
    </View>
  );
}

export function InformeEquipo({
  logoBase64,
  logoClienteBase64,
  equipo,
  cliente,
  sede,
  mantenimiento,
}: InformeEquipoProps) {
  const hasFotos = mantenimiento.fotos && mantenimiento.fotos.length > 0;
  const resultados = normalizeResultados(mantenimiento.checklist as unknown);
  const secciones = resultados.secciones;
  const hasSecciones = secciones.length > 0;

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
              {logoClienteBase64 && (
                <Image style={styles.logoCliente} src={logoClienteBase64} />
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
                  <Text style={styles.label}>Sede:</Text>
                  <Text style={styles.value}>{sede?.nombre || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Ciudad:</Text>
                  <Text style={styles.value}>{sede?.ciudad || cliente.ciudad || "—"}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Dirección:</Text>
                  <Text style={styles.value}>{sede?.direccion || cliente.direccion || "—"}</Text>
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
              {mantenimiento.orden_servicio && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Orden de servicio:</Text>
                    <Text style={styles.value}>{mantenimiento.orden_servicio}</Text>
                  </View>
                </View>
              )}
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Profesional:</Text>
                  <Text style={styles.value}>{mantenimiento.tecnico_nombre}</Text>
                </View>
              </View>
              {mantenimiento.numero_informe && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>N° de informe:</Text>
                    <Text style={styles.value}>{mantenimiento.numero_informe}</Text>
                  </View>
                </View>
              )}
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Fecha ejecución:</Text>
                  <Text style={styles.value}>{mantenimiento.fecha}</Text>
                </View>
              </View>
              {equipo.fecha_proximo_mantenimiento && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Próximo mantenimiento:</Text>
                    <Text style={styles.value}>{equipo.fecha_proximo_mantenimiento}</Text>
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

          {/* Secciones de verificación (checklist y mediciones) */}
          {hasSecciones &&
            secciones.map((sec, i) => {
              if (sec.tipo === "checklist") {
                return (
                  <ContentBlock key={i} style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {sec.titulo || "Lista de verificación"}
                    </Text>
                    <View style={styles.checklistGrid}>
                      {sec.items.map((item, j) => (
                        <View key={j} style={styles.checklistItem}>
                          <View style={styles.checklistBox}>
                            {item.cumple && <CheckIcon />}
                          </View>
                          <View style={styles.checklistTextWrap}>
                            <Text style={styles.checklistText}>{item.nombre}</Text>
                            {item.observacion && (
                              <Text style={styles.checklistObs}>{item.observacion}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </ContentBlock>
                );
              }

              return (
                <ContentBlock key={i} style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {sec.titulo || "Mediciones"}
                  </Text>
                  {sec.grupos.map((grupo, gi) => (
                    <View key={gi}>
                      {grupo.titulo && (
                        <Text style={styles.boxTitle}>{grupo.titulo}</Text>
                      )}
                      <View style={styles.table}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, { width: "52%" }]}>Parámetro</Text>
                          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Unidad</Text>
                          <Text style={[styles.tableHeaderCell, { width: "30%" }]}>Valor medido</Text>
                        </View>
                        {grupo.campos.map((m, ci) => (
                          <View
                            key={ci}
                            style={[styles.tableRow, ci % 2 === 0 ? { backgroundColor: "#fafafa" } : undefined] as any}
                          >
                            <Text style={[styles.tableCell, { width: "52%" }]}>{m.nombre}</Text>
                            <Text style={[styles.tableCell, { width: "18%" }]}>{m.unidad}</Text>
                            <Text style={[styles.tableCell, { width: "30%" }]}>{m.valor || "—"}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </ContentBlock>
              );
            })}

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
              <View style={styles.firmaImageArea}>
                {mantenimiento.firma_tecnico ? (
                  <Image style={{ width: 120, height: 50, objectFit: "contain" }} src={mantenimiento.firma_tecnico} />
                ) : (
                  <View style={styles.firmaLine} />
                )}
              </View>
              <Text style={styles.firmaText}>Firma del profesional que ejecuta</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{mantenimiento.tecnico_nombre}</Text>
            </View>
            <View style={styles.firmaBox}>
              <View style={styles.firmaImageArea}>
                {mantenimiento.firma_aprobador ? (
                  <Image style={{ width: 120, height: 50, objectFit: "contain" }} src={mantenimiento.firma_aprobador} />
                ) : (
                  <View style={styles.firmaLine} />
                )}
              </View>
              <Text style={styles.firmaText}>Firma del profesional que aprueba</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{mantenimiento.aprobador_nombre || ""}</Text>
            </View>
            <View style={styles.firmaBox}>
              <View style={styles.firmaImageArea}>
                {mantenimiento.firma_recibe ? (
                  <Image style={{ width: 120, height: 50, objectFit: "contain" }} src={mantenimiento.firma_recibe} />
                ) : (
                  <View style={styles.firmaLine} />
                )}
              </View>
              <Text style={styles.firmaText}>Firma de quien recibe a satisfacción</Text>
              <Text style={[styles.firmaText, { marginTop: 2 }]}>{cliente.nombre}</Text>
            </View>
          </ContentBlock>
        </View>

      </Page>
    </Document>
  );
}