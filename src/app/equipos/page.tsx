"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { downloadCsv } from "@/lib/csv";
import { DeleteEquipoButton } from "./_components/DeleteEquipoButton";
import { AppHeader } from "@/components/AppHeader";

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clienteId = params.get("cliente_id") || "";
    const sedeId = params.get("sede_id") || "";
    if (clienteId) setFiltroCliente(clienteId);
    if (sedeId) setFiltroSede(sedeId);

    const searchParams = new URLSearchParams();
    if (clienteId) searchParams.set("cliente_id", clienteId);
    if (sedeId) searchParams.set("sede_id", sedeId);
    const qs = searchParams.toString();
    const url = qs ? `/api/equipos?${qs}` : "/api/equipos";
    Promise.all([
      fetch("/api/perfil").then(r => r.json()),
      fetch(url).then(r => r.json()),
      fetch("/api/clientes").then(r => r.json()),
      fetch("/api/sedes").then(r => r.json()),
    ]).then(([perfil, equiposData, clientesData, sedesData]) => {
      setProfile(perfil);
      setEquipos(Array.isArray(equiposData) ? equiposData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
      // Para clientes: setear filtroCliente con su propio ID para que funcione el filtro de sede
      if (perfil?.role === "cliente" && !clienteId) {
        setFiltroCliente(perfil.id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const esAdmin = profile?.role === "administrador";

  const sedesFiltradas = sedes.filter((s: any) => s.cliente_id === filtroCliente);

  useEffect(() => {
    if (profile?.role === "tecnico") {
      window.location.href = "/dashboard";
    }
  }, [profile]);

  const filtrados = useMemo(() => {
    return equipos.filter((eq) => {
      if (filtroCliente && eq.cliente_id !== filtroCliente) return false;
      if (filtroSede && eq.sede_id !== filtroSede) return false;
      if (filtroEquipo && !eq.nombre.toLowerCase().includes(filtroEquipo.toLowerCase())) return false;
      if (filtroModelo && !(eq.modelo || "").toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      if (filtroFechaInicio && eq.ultimo_informe_fecha) {
        if (new Date(eq.ultimo_informe_fecha) < new Date(filtroFechaInicio)) return false;
      }
      if (filtroFechaFin && eq.ultimo_informe_fecha) {
        if (new Date(eq.ultimo_informe_fecha) > new Date(filtroFechaFin)) return false;
      }
      if (filtroUbicacion && !(eq.ubicacion || "").toLowerCase().includes(filtroUbicacion.toLowerCase())) return false;
      return true;
    });
  }, [equipos, filtroCliente, filtroSede, filtroEquipo, filtroModelo, filtroFechaInicio, filtroFechaFin, filtroUbicacion]);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
      <p className="text-zinc-400">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader links={[{ href: "/dashboard", label: "Inicio" }]} userNombre={profile?.nombre} userRole={profile?.role} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-secondary">Equipos</h2>
            <p className="text-zinc-500">{filtrados.length} de {equipos.length} equipos</p>
          </div>
          <div className="flex gap-2">
            {esAdmin && (
              <Link
                href="/equipos/nuevo"
                className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90"
              >
                + Nuevo equipo
              </Link>
            )}
            {filtrados.length > 0 && (
              <button
                type="button"
                onClick={() => downloadCsv(
                  filtrados.map((eq: any) => ({
                    Nombre: eq.nombre,
                    Tipo: eq.tipo,
                    Marca: eq.marca,
                    Modelo: eq.modelo,
                    Serie: eq.serie,
                    Ubicacion: eq.ubicacion,
                    "Ultimo mant.": eq.fecha_ultimo_mantenimiento || "",
                    "Proximo mant.": eq.fecha_proximo_mantenimiento || "",
                  })),
                  "equipos",
                )}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
              >
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-3">
          {filtroCliente && sedesFiltradas.length > 0 && (
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
            >
              <option value="">Todas las sedes</option>
              {sedesFiltradas.map((s: any) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          )}
          {esAdmin && (
            <select
              value={filtroCliente}
              onChange={(e) => { setFiltroCliente(e.target.value); setFiltroSede(""); }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cl: any) => (
                <option key={cl.id} value={cl.id}>{cl.nombre}</option>
              ))}
            </select>
          )}
          <input
            placeholder="Buscar equipo..."
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
          />
          <input
            placeholder="Buscar modelo..."
            value={filtroModelo}
            onChange={(e) => setFiltroModelo(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
          />
          <input
            placeholder="Filtrar ubicación..."
            value={filtroUbicacion}
            onChange={(e) => setFiltroUbicacion(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
          />
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={(e) => setFiltroFechaInicio(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
            title="Último informe desde"
          />
          <input
            type="date"
            value={filtroFechaFin}
            onChange={(e) => setFiltroFechaFin(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
            title="Último informe hasta"
          />
        </div>

        {filtrados.length === 0 ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No se encontraron equipos con los filtros actuales</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/60 bg-white shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left text-sm text-zinc-500">
                  <th className="px-5 py-3 font-medium">Equipo</th>
                  <th className="px-5 py-3 font-medium">Marca</th>
                  <th className="px-5 py-3 font-medium">Modelo</th>
                  <th className="px-5 py-3 font-medium">Serie</th>
                  <th className="px-5 py-3 font-medium">Ubicación</th>
                    {esAdmin && <th className="px-5 py-3 font-medium">Cliente</th>}
                    {filtroCliente && sedesFiltradas.length > 0 && <th className="px-5 py-3 font-medium">Sede</th>}
                    <th className="px-5 py-3 font-medium">Próximo mant.</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((eq) => (
                  <tr
                    key={eq.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-brand-secondary">{eq.nombre}</div>
                      {eq.id_cliente && (
                        <div className="text-xs text-zinc-400">ID: {eq.id_cliente}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{eq.marca || "—"}</td>
                    <td className="px-5 py-4 text-zinc-600">{eq.modelo || "—"}</td>
                    <td className="px-5 py-4 font-mono text-sm text-zinc-500">{eq.serie}</td>
                    <td className="px-5 py-4 text-zinc-600">{eq.ubicacion || "—"}</td>
                    {esAdmin && (
                      <td className="px-5 py-4 text-zinc-600">
                        <div>{(eq.cliente as any)?.nombre ?? "—"}</div>
                        {(eq.cliente as any)?.ciudad && (
                          <div className="text-xs text-zinc-400">{(eq.cliente as any)?.ciudad}</div>
                        )}
                      </td>
                    )}
                    {filtroCliente && sedesFiltradas.length > 0 && (
                      <td className="px-5 py-4 text-zinc-600">
                        {(eq.sede as any)?.nombre || "—"}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {eq.fecha_proximo_mantenimiento ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          new Date(eq.fecha_proximo_mantenimiento) <= new Date()
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}>
                          {new Date(eq.fecha_proximo_mantenimiento).toLocaleDateString("es-ES")}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/equipos/${eq.id}`} className="text-sm font-medium text-brand-primary hover:text-brand-primary/80">
                          Ver
                        </Link>
                        {esAdmin && (
                          <DeleteEquipoButton id={eq.id} nombre={eq.nombre} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
