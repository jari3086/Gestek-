import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TemplateForm from "../_components/TemplateForm";

export default async function NuevaPlantillaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "administrador") redirect("/dashboard");

  return <TemplateForm />;
}
