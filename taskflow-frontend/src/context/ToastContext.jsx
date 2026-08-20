import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, { type = "info", timeout = 5000 } = {}) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      if (timeout) setTimeout(() => dismiss(id), timeout);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="glass-panel pointer-events-auto flex items-start gap-3 px-4 py-3 animate-[toastIn_200ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                t.type === "error"
                  ? "bg-accent-rose"
                  : t.type === "success"
                  ? "bg-accent-teal"
                  : "bg-brand-400"
              }`}
            />
            <p className="toast-text text-sm leading-snug text-mist-100/90">
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-auto text-mist-100/40 hover:text-mist-100"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
