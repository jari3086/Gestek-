import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TemplateForm from "../_components/TemplateForm";

export default async function EditarPlantillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: plantilla } = await supabase
    .from("plantillas")
    .select("*")
    .eq("id", id)
    .single();

  if (!plantilla) redirect("/plantillas");

  return (
    <TemplateForm
      plantilla={{
        id: plantilla.id,
        nombre: plantilla.nombre,
        descripcion: plantilla.descripcion || "",
        items: plantilla.items as any[],
      }}
    />
  );
}
