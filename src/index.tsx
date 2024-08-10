import React from "react";
import { toast, ToastState } from "./state";
import "./styles.css";
import { ToastProps, ToastT } from "./types";

// Default toast width
const TOAST_WIDTH = 356;

const Toast = (props: ToastProps) => {
  const { toast } = props;
  return <li data-sonner-toast>{toast.title}</li>;
};

const Toaster = () => {
  const [toasts, setToasts] = React.useState<ToastT[]>([]);

  React.useEffect(() => {
    return ToastState.subscribe((toast) => {
      setToasts((prevToasts) => {
        return [toast, ...prevToasts];
      });
    });
  }, []);

  return (
    <section>
      <ol
        data-sonner-toaster
        style={
          {
            "--width": `${TOAST_WIDTH}px`,
          } as React.CSSProperties
        }
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </ol>
    </section>
  );
};

export { toast, Toaster };
