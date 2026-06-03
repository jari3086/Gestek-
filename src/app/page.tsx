import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] p-8">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-card">
        <div className="text-center">
          <Image
            src="/logo gestek.png"
            alt="Gestek"
            width={96}
            height={96}
            className="mx-auto mb-6 h-24 w-auto"
          />
          <h1 className="text-2xl font-bold text-brand-secondary">
            GESTEK
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Gestión de inventario, informes y facturación para equipos
            biomédicos
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full rounded-xl bg-brand-primary px-4 py-3 text-center font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark"
          >
            Iniciar sesión
          </a>
          <p className="text-center text-sm text-zinc-400">
            ¿Eres cliente? Solicita tu acceso con el administrador
          </p>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Plataforma para profesionales biomédicos y entidades de salud
        </p>
      </div>
    </div>
  );
}
