---
title: "Lista de Chequeo — Plan de Migración y Respaldo de Datos"
---

<style>
  @page {
    size: A4;
    margin: 2cm 2.5cm;
  }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
  }
  .cover-page {
    page-break-after: always;
    text-align: center;
    padding-top: 6cm;
  }
  .cover-page h1 {
    font-size: 22pt;
    color: #1a3a5c;
    margin-bottom: 0.5cm;
    border-bottom: 3px solid #1a3a5c;
    padding-bottom: 0.5cm;
  }
  .cover-page .subtitle {
    font-size: 14pt;
    color: #555;
    margin-top: 1cm;
  }
  .cover-page .meta {
    margin-top: 3cm;
    font-size: 11pt;
    color: #333;
  }
  .cover-page .meta p {
    margin: 0.3cm 0;
  }
  h1 { font-size: 18pt; color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 0.3cm; margin-top: 1.5cm; }
  h2 { font-size: 14pt; color: #2a5a8c; margin-top: 1cm; }
  h3 { font-size: 12pt; color: #3a6a9c; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.5cm 0;
    font-size: 9.5pt;
  }
  th {
    background-color: #1a3a5c;
    color: white;
    padding: 6px 8px;
    text-align: center;
    font-weight: bold;
  }
  td {
    border: 1px solid #ccc;
    padding: 5px 8px;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background-color: #f5f8fc;
  }
  .checklist-item td:first-child {
    width: 4%;
    text-align: center;
  }
  .checklist-item td:nth-child(2) {
    width: 36%;
  }
  .checklist-item td:nth-child(3),
  .checklist-item td:nth-child(4) {
    width: 8%;
    text-align: center;
  }
  .checklist-item td:nth-child(5) {
    width: 16%;
  }
  .checklist-item td:nth-child(6) {
    width: 12%;
    text-align: center;
  }
  .checklist-item td:nth-child(7) {
    width: 16%;
    text-align: center;
  }
  .section-intro {
    background: #e8f0fa;
    padding: 0.5cm;
    border-left: 4px solid #1a3a5c;
    margin: 0.5cm 0;
    font-size: 10pt;
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 9pt;
    font-weight: bold;
  }
  .tag-alto { background: #f8d7da; color: #721c24; }
  .tag-medio { background: #fff3cd; color: #856404; }
  .tag-bajo { background: #d4edda; color: #155724; }
  ul, ol { margin: 0.3cm 0; padding-left: 0.7cm; }
  li { margin: 0.15cm 0; }
  .ref-list { font-size: 10pt; }
  p { text-align: justify; }
</style>

<div class="cover-page">

# Plan de Migración y Respaldo de Datos

## Lista de Chequeo para Migración de Software y Revisión de Modificaciones

<div class="subtitle">
GESTEK — Sistema de Gestión de Equipos Biomédicos
</div>

<div class="meta">
<p><strong>Proyecto:</strong> biomed-inventory</p>
<p><strong>Versión del sistema:</strong> 0.1.0</p>
<p><strong>Documento:</strong> PC-MIG-001</p>
<p><strong>Fecha de elaboración:</strong> Julio 2026</p>
<p><strong>Elaborado por:</strong> </p>
<p><strong>Revisado por:</strong> </p>
<p><strong>Aprobado por:</strong> </p>
</div>

</div>

---

# 1. Introducción

## 1.1 Propósito

El presente documento constituye una lista de chequeo para el proceso de **migración de software y respaldo de datos** del sistema GESTEK — Sistema de Gestión de Equipos Biomédicos. Su objetivo es establecer un instrumento de verificación sistemática que permita evaluar el cumplimiento de cada actividad crítica durante un proceso de migración, garantizando la integridad, disponibilidad y confidencialidad de los datos, así como la continuidad operativa del sistema.

## 1.2 Alcance

Este instrumento aplica a todas las actividades de migración y respaldo de datos del sistema GESTEK, incluyendo:

- Migración de base de datos PostgreSQL (Supabase)
- Migración de almacenamiento de archivos (Supabase Storage)
- Migración del código fuente y despliegue
- Migración de configuración de infraestructura
- Respaldo y restauración de datos
- Validación de integridad post-migración

## 1.3 Definiciones

| Término | Definición |
|---------|------------|
| **Migración** | Proceso de trasladar el sistema o sus componentes de un entorno a otro, o de una versión a otra. |
| **Respaldo (Backup)** | Copia de seguridad de los datos y configuración del sistema que permite su restauración en caso de pérdida. |
| **Rollback** | Procedimiento para revertir una migración y retornar al estado anterior. |
| **Integridad de datos** | Garantía de que los datos no han sido alterados o perdidos durante la migración. |
| **Ventana de mantenimiento** | Período de tiempo programado durante el cual el sistema puede estar fuera de servicio para tareas de migración. |
| **RLS (Row Level Security)** | Políticas de seguridad a nivel de filas implementadas en Supabase. |

---

# 2. Identificación del Proceso a Evaluar

<div class="section-intro">
<strong>Proceso:</strong> Plan de Migración y Respaldo de Datos<br>
<strong>Sistema:</strong> GESTEK — Sistema de Gestión de Equipos Biomédicos<br>
<strong>Código del proceso:</strong> PC-MIG-001<br>
<strong>Versión del proceso:</strong> 1.0<br>
<strong>Responsable del proceso:</strong> Administrador del Sistema
</div>

---

# 3. Lista de Chequeo — Plan de Migración y Respaldo de Datos

## 3.1 Fase de Planificación

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>1</td>
  <td>Se ha documentado el alcance completo de la migración (componentes, datos, configuración)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>2</td>
  <td>Se ha identificado y documentado el inventario completo de tablas, columnas y relaciones en Supabase</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>3</td>
  <td>Se ha identificado el volumen total de datos a migrar (número de registros, tamaño en GB)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>4</td>
  <td>Se ha definido la ventana de mantenimiento con fecha y hora programada</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>5</td>
  <td>Se ha comunicado a los usuarios la ventana de inactividad planificada</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>6</td>
  <td>Se ha definido y documentado el plan de rollback (procedimiento para revertir la migración)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>7</td>
  <td>Se ha designado un responsable principal y un backup para cada actividad crítica</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>8</td>
  <td>Se ha preparado un checklist de verificación pre-migración y post-migración</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

## 3.2 Fase de Respaldo de Datos

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>9</td>
  <td>Se ha realizado backup completo de la base de datos PostgreSQL (pg_dump o Supabase CLI)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>10</td>
  <td>Se ha verificado la integridad del backup de base de datos (prueba de restauración en entorno aislado)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>11</td>
  <td>Se ha realizado backup del almacenamiento de archivos (Supabase Storage: fotos, logos, PDFs)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>12</td>
  <td>Se ha verificado la integridad de los archivos respaldados (conteo de archivos y checksums)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>13</td>
  <td>Se ha respaldado la configuración de autenticación (Supabase Auth: usuarios, roles, plantillas de email)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>14</td>
  <td>Se han respaldado las políticas de seguridad RLS (Row Level Security)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>15</td>
  <td>Se ha respaldado la configuración de variables de entorno (.env.local, Vercel env vars)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>16</td>
  <td>Se ha realizado backup del código fuente (git push a repositorio remoto, tag del release actual)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>17</td>
  <td>Los respaldos se han almacenado en una ubicación segura fuera del entorno de producción</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>18</td>
  <td>Se ha documentado la ubicación y método de acceso a cada respaldo realizado</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

## 3.3 Fase de Ejecución de la Migración

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>19</td>
  <td>Se ha creado y verificado el entorno de destino (nueva base de datos, nuevo bucket de storage)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>20</td>
  <td>Se ha ejecutado la migración en un entorno de prueba/staging antes de producción</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>21</td>
  <td>Se han ejecutado las migraciones SQL en orden cronológico (desde 00010 hasta 00020)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>22</td>
  <td>Se han migrado los datos de todas las tablas (profiles, equipos, mantenimientos, facturas, plantillas, etc.)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>23</td>
  <td>Se han migrado los archivos del bucket de almacenamiento (fotos, logos, informes PDF)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>24</td>
  <td>Se han restaurado y verificado las políticas RLS en el entorno de destino</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>25</td>
  <td>Se ha actualizado la configuración de autenticación (redirect URLs, plantillas de email)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>26</td>
  <td>Se han configurado las variables de entorno en la nueva infraestructura</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>27</td>
  <td>Se ha desplegado la aplicación en el nuevo entorno y verificado que compila correctamente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

## 3.4 Fase de Validación Post-Migración

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>28</td>
  <td>Se ha verificado el conteo de registros en cada tabla (origen vs destino)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>29</td>
  <td>Se ha verificado la integridad referencial (FKs) en la base de datos migrada</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>30</td>
  <td>Se ha verificado que los archivos del Storage se visualizan correctamente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>31</td>
  <td>Se ha probado la autenticación de usuarios (login/logout para cada rol: admin, técnico, cliente)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>32</td>
  <td>Se ha probado una operación CRUD en cada módulo crítico (clientes, equipos, mantenimientos)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>33</td>
  <td>Se ha probado la generación de PDF de informes con checklist, fotos y firmas</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>34</td>
  <td>Se ha probado la funcionalidad de facturación con preparación DIAN</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>35</td>
  <td>Se han ejecutado las pruebas automatizadas (Vitest) y todas pasan</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>36</td>
  <td>Se ha verificado que el dashboard muestra estadísticas y alertas correctamente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>37</td>
  <td>Se ha verificado el acceso según roles (RLS) — usuarios solo ven datos autorizados</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

## 3.5 Fase de Cierre y Monitoreo

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>38</td>
  <td>Se ha monitoreado el sistema durante 48 horas post-migración sin incidentes críticos</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>39</td>
  <td>Se ha actualizado la documentación del sistema reflejando la nueva configuración</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>40</td>
  <td>Se ha registrado la migración en el libro de cambios del sistema (changelog)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>41</td>
  <td>Se han documentado las lecciones aprendidas y recomendaciones para futuras migraciones</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>42</td>
  <td>Se ha notificado a los usuarios la finalización exitosa de la migración</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>43</td>
  <td>Se ha programado la primera revisión post-migración (a los 7 y 30 días)</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

---

# 4. Lista de Chequeo — Revisión de Modificaciones Post-Migración

## 4.1 Identificación del Proceso

<div class="section-intro">
<strong>Proceso:</strong> Revisión de Modificaciones Realizadas durante la Migración<br>
<strong>Sistema:</strong> GESTEK — Sistema de Gestión de Equipos Biomédicos<br>
<strong>Código del proceso:</strong> PC-MIG-002<br>
<strong>Versión del proceso:</strong> 1.0<br>
<strong>Responsable del proceso:</strong> Administrador del Sistema / Desarrollador de Mantenimiento
</div>

## 4.2 Ítems de Evaluación

<table>
<thead>
<tr>
  <th>#</th>
  <th>Ítem a Evaluar</th>
  <th>C</th>
  <th>NC</th>
  <th>Responsable</th>
  <th>Estado</th>
  <th>Fecha</th>
</tr>
</thead>
<tbody class="checklist-item">
<tr>
  <td>1</td>
  <td>Se ha verificado que no se modificaron tablas, columnas o tipos de datos no contemplados en el plan</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>2</td>
  <td>Se ha revisado el diff de esquema SQL (origen vs destino) para identificar cambios no planificados</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>3</td>
  <td>Se ha verificado que las migraciones SQL mantienen el orden y nomenclatura establecidos</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>4</td>
  <td>Se ha revisado el código fuente para identificar modificaciones no documentadas en el plan</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>5</td>
  <td>Se ha verificado que las variables de entorno son las correctas y no contienen credenciales expuestas</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>6</td>
  <td>Se ha verificado que las políticas RLS se mantienen intactas y funcionales</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>7</td>
  <td>Se ha verificado que las URLs de redirección y callback en Supabase Auth están actualizadas</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>8</td>
  <td>Se ha verificado que las plantillas de email de autenticación (bienvenida, restablecimiento) mantienen los enlaces correctos</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>9</td>
  <td>Se ha verificado que la configuración de rate limiting (Upstash) sigue operativa</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>10</td>
  <td>Se ha verificado que el service worker (PWA/Serwist) funciona correctamente tras la migración</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>11</td>
  <td>Se ha verificado que las URLs de los archivos en Storage se han actualizado correctamente en la BD</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>12</td>
  <td>Se ha verificado que los enlaces a los PDFs de informes siguen siendo accesibles</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>13</td>
  <td>Se ha verificado que las firmas digitales (base64) almacenadas en mantenimientos son legibles</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>14</td>
  <td>Se ha verificado que los datos fiscales (NIT, régimen, dirección) se migraron correctamente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>15</td>
  <td>Se ha verificado que la periodicidad de mantenimientos y fechas programadas se conservan</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>16</td>
  <td>Se ha verificado que los items de las plantillas de checklist (JSONB) se migraron íntegramente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>17</td>
  <td>Se ha verificado que los resultados de checklist (JSONB) asociados a mantenimientos se migraron</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>18</td>
  <td>Se ha verificado que el sistema de auditoría (audit_log) registra correctamente las operaciones</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>19</td>
  <td>Se ha verificado que los triggers y funciones de base de datos se migraron y ejecutan correctamente</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>20</td>
  <td>Se ha verificado que el seed.sql (datos de ejemplo) no fue ejecutado en el entorno de producción</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
</tbody>
</table>

---

# 5. Resumen de Cumplimiento

| Fase | Total Ítems | Cumple (C) | No Cumple (NC) | Grado de Cumplimiento |
|------|:-----------:|:----------:|:--------------:|:---------------------:|
| Planificación | 8 | | | |
| Respaldo de Datos | 10 | | | |
| Ejecución de Migración | 9 | | | |
| Validación Post-Migración | 10 | | | |
| Cierre y Monitoreo | 6 | | | |
| **Total Migración** | **43** | | | |
| Revisión de Modificaciones | 20 | | | |
| **Total General** | **63** | | | |

**Grado de Cumplimiento:** Bajo (0-50%) · Medio (51-79%) · Alto (80-100%)

---

# 6. Referencias

<div class="ref-list">

1. **ISO/IEC 14764:2006** — *Software Engineering — Software Life Cycle Processes — Maintenance*. International Organization for Standardization, 2006.

2. **NIST SP 800-53 Rev. 5** — *Security and Privacy Controls for Information Systems and Organizations*. National Institute of Standards and Technology, 2020.

3. **Supabase Documentation** — *Database Migrations*, *Backup & Restore*, *Row Level Security*. https://supabase.com/docs

4. **Vercel Documentation** — *Deployments*, *Environment Variables*, *Git Integration*. https://vercel.com/docs

5. **Next.js Documentation** — *Upgrading Guide*. https://nextjs.org/docs

6. **PostgreSQL Documentation** — *pg_dump*, *Continuous Archiving and Point-in-Time Recovery (PITR)*. https://postgresql.org/docs

7. **ISO/IEC 27001:2022** — *Information Security, Cybersecurity and Privacy Protection — Information Security Management Systems*. International Organization for Standardization, 2022.

8. **Ley 1581 de 2012** — *Por la cual se dictan disposiciones generales para la protección de datos personales en Colombia*. Congreso de la República de Colombia.

9. **Guía de Migración de Sistemas de Información** — *Ministerio de Tecnologías de la Información y las Comunicaciones de Colombia (MinTIC)*, 2021.

10. **Plan de Mantenimiento y Soporte de Software — GESTEK** — Documento interno del proyecto biomed-inventory, Julio 2026.

</div>

---

<div style="text-align: center; margin-top: 2cm; color: #888; font-size: 10pt;">
GESTEK — Sistema de Gestión de Equipos Biomédicos<br>
Documento PC-MIG-001 · Versión 1.0 · Julio 2026<br>
Este documento es confidencial y de uso interno del proyecto.
</div>
