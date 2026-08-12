


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."factura_estado" AS ENUM (
    'emitida',
    'pagada',
    'anulada'
);


ALTER TYPE "public"."factura_estado" OWNER TO "postgres";


CREATE TYPE "public"."mantenimiento_estado" AS ENUM (
    'pendiente',
    'completado'
);


ALTER TYPE "public"."mantenimiento_estado" OWNER TO "postgres";


CREATE TYPE "public"."mantenimiento_tipo" AS ENUM (
    'preventivo',
    'correctivo',
    'calibracion'
);


ALTER TYPE "public"."mantenimiento_tipo" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'tecnico',
    'cliente'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, role, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'cliente'),
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_audit_log"("p_user_id" "uuid", "p_action" "text", "p_entity" "text", "p_entity_id" "text" DEFAULT NULL::"text", "p_details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity, entity_id, details)
  VALUES (p_user_id, p_action, p_entity, p_entity_id, p_details);
END;
$$;


ALTER FUNCTION "public"."insert_audit_log"("p_user_id" "uuid", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity" "text" NOT NULL,
    "entity_id" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checklist_resultados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mantenimiento_id" "uuid" NOT NULL,
    "plantilla_id" "uuid" NOT NULL,
    "resultados" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checklist_resultados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."config_fiscal" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa" "text" DEFAULT 'Gestek'::"text" NOT NULL,
    "nit" "text" DEFAULT ''::"text" NOT NULL,
    "regimen" "text" DEFAULT 'comun'::"text" NOT NULL,
    "direccion" "text",
    "ciudad" "text",
    "departamento" "text",
    "telefono" "text",
    "email" "text",
    "logo_url" "text",
    "resolucion_numero" "text",
    "resolucion_prefijo" "text",
    "resolucion_desde" integer,
    "resolucion_hasta" integer,
    "resolucion_fecha_expiracion" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."config_fiscal" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "tipo" "text" NOT NULL,
    "serie" "text" NOT NULL,
    "ubicacion" "text" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "creado_por" "uuid" NOT NULL,
    "fecha_ultimo_mantenimiento" "date",
    "fecha_proximo_mantenimiento" "date",
    "fecha_ultima_calibracion" "date",
    "fecha_proxima_calibracion" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id_cliente" "text",
    "marca" "text",
    "modelo" "text",
    "accesorios" "text",
    "periodicidad_mantenimiento" integer,
    "sede_id" "uuid"
);


ALTER TABLE "public"."equipos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facturas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "mantenimiento_id" "uuid",
    "monto" numeric(10,2) NOT NULL,
    "fecha" "date" DEFAULT CURRENT_DATE NOT NULL,
    "estado" "public"."factura_estado" DEFAULT 'emitida'::"public"."factura_estado" NOT NULL,
    "pdf_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subtotal" numeric(12,2),
    "total_iva" numeric(12,2) DEFAULT 0,
    "total" numeric(12,2),
    "iva" "jsonb",
    "retencion_fuente" numeric(12,2) DEFAULT 0,
    "retencion_iva" numeric(12,2) DEFAULT 0,
    "retencion_ica" numeric(12,2) DEFAULT 0,
    "tipo_documento" "text" DEFAULT 'factura'::"text",
    "prefijo" "text",
    "numero_consecutivo" integer,
    "fecha_emision" timestamp with time zone,
    "fecha_vencimiento" "date",
    "forma_pago" "text" DEFAULT 'contado'::"text",
    "medio_pago" "text",
    "moneda" "text" DEFAULT 'COP'::"text",
    "cufe" "text",
    "estado_dian" "text" DEFAULT 'pendiente'::"text",
    "dian_response" "jsonb",
    "xml_firmado" "text"
);


ALTER TABLE "public"."facturas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fotos_mantenimiento" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mantenimiento_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "descripcion" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fotos_mantenimiento" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mantenimientos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipo_id" "uuid" NOT NULL,
    "tipo" "text" NOT NULL,
    "fecha" "date" DEFAULT CURRENT_DATE NOT NULL,
    "tecnico_id" "uuid" NOT NULL,
    "estado" "public"."mantenimiento_estado" DEFAULT 'pendiente'::"public"."mantenimiento_estado" NOT NULL,
    "pdf_url" "text",
    "observaciones" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "plantilla_id" "uuid",
    "conclusion" "text",
    "visible_para_cliente" boolean DEFAULT false NOT NULL,
    "orden_servicio" "text",
    "numero_informe" "text",
    "tecnico_nombre" "text",
    "firma_tecnico" "text",
    "firma_aprobador" "text",
    "firma_recibe" "text",
    "aprobador_nombre" "text"
);


ALTER TABLE "public"."mantenimientos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plantillas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "items" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."plantillas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'cliente'::"text" NOT NULL,
    "nombre" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefono" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nit" "text",
    "direccion" "text",
    "ciudad" "text",
    "logo_url" "text",
    "regimen" "text",
    "tipo_persona" "text" DEFAULT 'juridica'::"text",
    "departamento" "text",
    "codigo_postal" "text",
    "firma_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sedes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "direccion" "text",
    "ciudad" "text",
    "departamento" "text",
    "telefono" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sedes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checklist_resultados"
    ADD CONSTRAINT "checklist_resultados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."config_fiscal"
    ADD CONSTRAINT "config_fiscal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fotos_mantenimiento"
    ADD CONSTRAINT "fotos_mantenimiento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mantenimientos"
    ADD CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plantillas"
    ADD CONSTRAINT "plantillas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sedes"
    ADD CONSTRAINT "sedes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_log_action" ON "public"."audit_log" USING "btree" ("action");



CREATE INDEX "idx_audit_log_created_at" ON "public"."audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_log_user_id" ON "public"."audit_log" USING "btree" ("user_id");



CREATE INDEX "idx_equipos_cliente" ON "public"."equipos" USING "btree" ("cliente_id");



CREATE INDEX "idx_equipos_tecnico" ON "public"."equipos" USING "btree" ("creado_por");



CREATE INDEX "idx_facturas_cliente" ON "public"."facturas" USING "btree" ("cliente_id");



CREATE INDEX "idx_facturas_consecutivo" ON "public"."facturas" USING "btree" ("prefijo", "numero_consecutivo");



CREATE INDEX "idx_facturas_cufe" ON "public"."facturas" USING "btree" ("cufe");



CREATE INDEX "idx_facturas_estado_dian" ON "public"."facturas" USING "btree" ("estado_dian");



CREATE INDEX "idx_mantenimientos_equipo" ON "public"."mantenimientos" USING "btree" ("equipo_id");



CREATE INDEX "idx_mantenimientos_tecnico" ON "public"."mantenimientos" USING "btree" ("tecnico_id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."checklist_resultados"
    ADD CONSTRAINT "checklist_resultados_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "public"."mantenimientos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checklist_resultados"
    ADD CONSTRAINT "checklist_resultados_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "public"."plantillas"("id");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "public"."mantenimientos"("id");



ALTER TABLE ONLY "public"."fotos_mantenimiento"
    ADD CONSTRAINT "fotos_mantenimiento_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "public"."mantenimientos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mantenimientos"
    ADD CONSTRAINT "mantenimientos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mantenimientos"
    ADD CONSTRAINT "mantenimientos_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "public"."plantillas"("id");



ALTER TABLE ONLY "public"."mantenimientos"
    ADD CONSTRAINT "mantenimientos_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sedes"
    ADD CONSTRAINT "sedes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admin actualiza facturas" ON "public"."facturas" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin actualiza mantenimientos" ON "public"."mantenimientos" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin elimina facturas" ON "public"."facturas" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin elimina mantenimientos" ON "public"."mantenimientos" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin gestiona plantillas" ON "public"."plantillas" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin inserta facturas" ON "public"."facturas" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "Admin ve todas las facturas, clientes ven las suyas" ON "public"."facturas" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))) OR ("cliente_id" = "auth"."uid"())));



CREATE POLICY "Admin ve todos los equipos, tecnicos ven todos, clientes ven lo" ON "public"."equipos" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))) OR ("cliente_id" = "auth"."uid"())));



CREATE POLICY "Admin ve todos, tecnicos ven los suyos, clientes ven visibles" ON "public"."mantenimientos" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))) OR ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'tecnico'::"text")))) AND ("tecnico_id" = "auth"."uid"())) OR ((EXISTS ( SELECT 1
   FROM "public"."equipos"
  WHERE (("equipos"."id" = "mantenimientos"."equipo_id") AND ("equipos"."cliente_id" = "auth"."uid"())))) AND ("visible_para_cliente" = true))));



CREATE POLICY "Admin y tecnicos actualizan equipos" ON "public"."equipos" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Admin y tecnicos eliminan equipos" ON "public"."equipos" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Admin y tecnicos gestionan checklist" ON "public"."checklist_resultados" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Admin y tecnicos gestionan fotos" ON "public"."fotos_mantenimiento" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Admin y tecnicos insertan mantenimientos" ON "public"."mantenimientos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Admin y tecnicos pueden insertar equipos" ON "public"."equipos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))))));



CREATE POLICY "Clientes pueden ver checklist de sus equipos" ON "public"."checklist_resultados" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."mantenimientos" "m"
     JOIN "public"."equipos" "e" ON (("e"."id" = "m"."equipo_id")))
  WHERE (("m"."id" = "checklist_resultados"."mantenimiento_id") AND ("e"."cliente_id" = "auth"."uid"())))));



CREATE POLICY "Clientes pueden ver fotos de sus equipos" ON "public"."fotos_mantenimiento" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."mantenimientos" "m"
     JOIN "public"."equipos" "e" ON (("e"."id" = "m"."equipo_id")))
  WHERE (("m"."id" = "fotos_mantenimiento"."mantenimiento_id") AND ("e"."cliente_id" = "auth"."uid"())))));



CREATE POLICY "Clientes pueden ver plantillas" ON "public"."plantillas" FOR SELECT USING (true);



CREATE POLICY "Tecnicos pueden actualizar cualquier perfil" ON "public"."profiles" FOR UPDATE USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"])));



CREATE POLICY "Tecnicos ven todos los perfiles" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['administrador'::"text", 'tecnico'::"text"]))));



CREATE POLICY "Usuarios actualizan su propio perfil" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuarios ven su propio perfil" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."checklist_resultados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."config_fiscal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."facturas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fotos_mantenimiento" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mantenimientos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plantillas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sedes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sedes_delete" ON "public"."sedes" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "sedes_insert" ON "public"."sedes" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));



CREATE POLICY "sedes_select" ON "public"."sedes" FOR SELECT USING (true);



CREATE POLICY "sedes_update" ON "public"."sedes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'administrador'::"text")))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_user_id" "uuid", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_user_id" "uuid", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_user_id" "uuid", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."checklist_resultados" TO "anon";
GRANT ALL ON TABLE "public"."checklist_resultados" TO "authenticated";
GRANT ALL ON TABLE "public"."checklist_resultados" TO "service_role";



GRANT ALL ON TABLE "public"."config_fiscal" TO "anon";
GRANT ALL ON TABLE "public"."config_fiscal" TO "authenticated";
GRANT ALL ON TABLE "public"."config_fiscal" TO "service_role";



GRANT ALL ON TABLE "public"."equipos" TO "anon";
GRANT ALL ON TABLE "public"."equipos" TO "authenticated";
GRANT ALL ON TABLE "public"."equipos" TO "service_role";



GRANT ALL ON TABLE "public"."facturas" TO "anon";
GRANT ALL ON TABLE "public"."facturas" TO "authenticated";
GRANT ALL ON TABLE "public"."facturas" TO "service_role";



GRANT ALL ON TABLE "public"."fotos_mantenimiento" TO "anon";
GRANT ALL ON TABLE "public"."fotos_mantenimiento" TO "authenticated";
GRANT ALL ON TABLE "public"."fotos_mantenimiento" TO "service_role";



GRANT ALL ON TABLE "public"."mantenimientos" TO "anon";
GRANT ALL ON TABLE "public"."mantenimientos" TO "authenticated";
GRANT ALL ON TABLE "public"."mantenimientos" TO "service_role";



GRANT ALL ON TABLE "public"."plantillas" TO "anon";
GRANT ALL ON TABLE "public"."plantillas" TO "authenticated";
GRANT ALL ON TABLE "public"."plantillas" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sedes" TO "anon";
GRANT ALL ON TABLE "public"."sedes" TO "authenticated";
GRANT ALL ON TABLE "public"."sedes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































