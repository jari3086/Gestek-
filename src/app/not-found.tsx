import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] p-8">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-card text-center">
        <Image
          src="/logo gestek.png"
          alt="Gestek"
          width={64}
          height={64}
          className="mx-auto mb-4 h-16 w-auto"
        />
        <h1 className="text-5xl font-bold text-brand-secondary">404</h1>
        <p className="text-lg font-medium text-zinc-600">Página no encontrada</p>
        <p className="text-sm text-zinc-400">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-brand-primary px-6 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
