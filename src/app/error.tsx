"use client";

import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-brand-secondary">Algo salió mal</h1>
        <p className="text-sm text-zinc-500">
          Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 font-mono">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-xl bg-brand-primary px-6 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
