"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [setupMsg, setSetupMsg] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetup = async () => {
    setSetupLoading(true);
    setSetupMsg(null);
    try {
      const res = await fetch("/api/setup");
      const data = await res.json();
      setSetupMsg(data.message || data.error || "Error");
    } catch {
      setSetupMsg("Error de conexión");
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <Image
            src="/logo gestek.png"
            alt="Gestek"
            width={80}
            height={80}
            className="mx-auto mb-6 h-20 w-auto"
          />
          <h1 className="text-xl font-bold text-brand-secondary">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-zinc-500">
            Ingresa a tu cuenta de Gestek
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-600"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition-shadow focus:border-brand-primary focus:ring-brand-primary/20 placeholder:text-zinc-400"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-600"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition-shadow focus:border-brand-primary focus:ring-brand-primary/20 placeholder:text-zinc-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {setupMsg && (
            <p className="mb-2 text-xs text-zinc-500">{setupMsg}</p>
          )}
          <button
            type="button"
            onClick={handleSetup}
            disabled={setupLoading}
            className="text-xs text-zinc-400 underline hover:text-brand-primary disabled:opacity-50"
          >
            {setupLoading ? "Configurando..." : "¿Primera vez? Configurar administrador"}
          </button>
        </div>
      </div>
    </div>
  );
}
