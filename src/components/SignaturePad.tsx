"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface SignaturePadProps {
  label: string;
  name: string;
  defaultValue?: string;
  firmaUrl?: string;
  firmaNombre?: string;
}

export function SignaturePad({ label, name, defaultValue, firmaUrl, firmaNombre }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!defaultValue);
  const [mode, setMode] = useState<"touch" | "saved">(defaultValue && defaultValue === firmaUrl ? "saved" : "touch");
  const inputRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    scaleRef.current = dpr;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (defaultValue && mode === "touch") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      };
      img.onerror = () => ctx.clearRect(0, 0, displayWidth, displayHeight);
      img.src = defaultValue;
    }
  }, [defaultValue, mode]);

  useEffect(() => {
    if (mode === "saved" && firmaUrl && inputRef.current) {
      inputRef.current.value = firmaUrl;
    }
  }, [mode, firmaUrl]);

  useEffect(() => {
    if (defaultValue && mode === "touch" && inputRef.current) {
      inputRef.current.value = defaultValue;
    }
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cssX = (canvas.clientWidth || rect.width) / rect.width;
    const cssY = (canvas.clientHeight || rect.height) / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * cssX,
        y: (e.touches[0].clientY - rect.top) * cssY,
      };
    }
    return {
      x: (e.clientX - rect.left) * cssX,
      y: (e.clientY - rect.top) * cssY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
    setMode("touch");
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    if (inputRef.current) inputRef.current.value = dataUrl;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setHasSignature(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const usarGuardada = () => {
    setMode("saved");
    setHasSignature(true);
    if (inputRef.current && firmaUrl) inputRef.current.value = firmaUrl;
  };

  const firmarAhora = () => {
    setMode("touch");
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setHasSignature(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-600">{label}</label>

      {firmaUrl && (
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={usarGuardada}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
              mode === "saved"
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            Usar firma guardada{firmaNombre ? ` (${firmaNombre})` : ""}
          </button>
          <button
            type="button"
            onClick={firmarAhora}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
              mode === "touch"
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            Firmar ahora
          </button>
        </div>
      )}

      {mode === "saved" && firmaUrl ? (
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2">
          <img src={firmaUrl} alt="Firma guardada" className="max-h-[80px] w-auto object-contain" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full touch-none cursor-crosshair"
            style={{ minHeight: 120 }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      )}

      <input ref={inputRef} type="hidden" name={name} />
      {mode === "touch" && hasSignature && (
        <button
          type="button"
          onClick={clear}
          className="mt-1 text-xs text-zinc-400 hover:text-red-500"
        >
          Limpiar firma
        </button>
      )}
    </div>
  );
}
