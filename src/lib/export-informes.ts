type Fila = Record<string, string | number | null | undefined>;

export type EquipoHistorial = {
  id: string;
  nombre?: string | null;
  modelo?: string | null;
  marca?: string | null;
  serie?: string | null;
  ubicacion?: string | null;
  id_cliente?: string | null;
  sede?: { nombre?: string | null } | null;
  cliente?: { nombre?: string | null } | null;
};

export type MantenimientoHistorial = {
  equipo_id: string;
  tipo?: string | null;
  fecha?: string | null;
  numero_informe?: string | null;
};

export function buildFilasHistorial(
  equipos: EquipoHistorial[],
  mantenimientos: MantenimientoHistorial[],
  esCliente: boolean,
): Fila[] {
  const porEquipo = new Map<string, MantenimientoHistorial[]>();
  for (const m of mantenimientos) {
    const lista = porEquipo.get(m.equipo_id) ?? [];
    lista.push(m);
    porEquipo.set(m.equipo_id, lista);
  }

  const base = (eq: EquipoHistorial): Fila => {
    const columnas: Fila = {};
    if (!esCliente) {
      columnas.Cliente = eq.cliente?.nombre ?? "";
    }
    columnas.Sede = eq.sede?.nombre ?? "";
    columnas.Equipo = eq.nombre ?? "";
    columnas["ID cliente"] = eq.id_cliente ?? "";
    columnas.Modelo = eq.modelo ?? "";
    columnas.Marca = eq.marca ?? "";
    columnas.Serie = eq.serie ?? "";
    columnas["Ubicación"] = eq.ubicacion ?? "";
    return columnas;
  };

  const filas: Fila[] = [];
  for (const eq of equipos) {
    const infos = porEquipo.get(eq.id) ?? [];
    if (infos.length === 0) {
      filas.push({
        ...base(eq),
        Servicio: "Sin registro",
        "N° de informe": "Sin registro",
        Fecha: "Sin registro",
      });
    } else {
      for (const m of infos) {
        filas.push({
          ...base(eq),
          Servicio: m.tipo ?? "",
          "N° de informe": m.numero_informe ?? "",
          Fecha: m.fecha ?? "",
        });
      }
    }
  }
  return filas;
}