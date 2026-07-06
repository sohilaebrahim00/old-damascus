"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToasterContext = createContext<ToasterContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToasterContext);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-success" />,
    error: <AlertCircle className="w-4 h-4 text-error" />,
    info: <Info className="w-4 h-4 text-brand-dark" />,
  };

  return (
    <ToasterContext.Provider value={{ toast }}>
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl bg-white border shadow-card-hover pointer-events-auto",
              "animate-slide-up",
              t.type === "success" && "border-success/30",
              t.type === "error" && "border-error/30",
              t.type === "info" && "border-brand/30"
            )}
          >
            {icons[t.type]}
            <p className="text-sm text-olive-dark flex-1">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="p-0.5 rounded hover:bg-cream transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5 text-olive" />
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
