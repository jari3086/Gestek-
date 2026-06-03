"use client";

import { useState, useCallback, createContext, useContext } from "react";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: "",
    message: "",
  });
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);
  const [pending, setPending] = useState(false);

  const confirm = useCallback((opts: ConfirmDialogOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleConfirm = () => {
    setPending(true);
    resolve?.(true);
    setOpen(false);
    setPending(false);
  };

  const handleCancel = () => {
    resolve?.(false);
    setOpen(false);
  };

  const variantStyles = {
    danger: {
      icon: "bg-red-100",
      iconSvg: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-amber-100",
      iconSvg: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: "bg-blue-100",
      iconSvg: "text-blue-600",
      button: "bg-brand-primary hover:bg-brand-primary-dark",
    },
  };

  const v = variantStyles[options.variant || "danger"];

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-dropdown">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${v.icon}`}>
              <svg className={`h-6 w-6 ${v.iconSvg}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {options.variant === "info" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-brand-secondary">
              {options.title}
            </h3>
            <p className="mb-6 text-center text-sm text-zinc-500">
              {options.message}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                {options.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all disabled:opacity-50 ${v.button}`}
              >
                {pending ? "Eliminando..." : options.confirmText || "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}
