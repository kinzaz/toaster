import React from "react";
import { toast, ToastState } from "./state";
import "./styles.css";
import { ToasterProps, ToastProps, ToastT } from "./types";

// Default toast width
const TOAST_WIDTH = 356;

// Viewport padding
const VIEWPORT_OFFSET = "32px";

const Toast = (props: ToastProps) => {
  const { toast } = props;
  return <li data-sonner-toast>{toast.title}</li>;
};

const Toaster = (props: ToasterProps) => {
  const { position = "bottom-right", offset } = props;
  const [toasts, setToasts] = React.useState<ToastT[]>([]);

  const [y, x] = position.split("-");

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
        data-y-position={y}
        data-x-position={x}
        style={
          {
            "--width": `${TOAST_WIDTH}px`,
            "--offset": offset ? `${offset}px` : VIEWPORT_OFFSET,
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
