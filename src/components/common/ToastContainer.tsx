import { AnimatePresence } from "framer-motion";
import type { ToastContainerProps } from "../../types";
import { Toast as ToastComponent } from "./Toast";

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
