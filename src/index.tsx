import React from "react";
import { toast, ToastState } from "./state";
import "./styles.css";
import { ToasterProps, ToastProps, ToastT } from "./types";

// Default toast width
const TOAST_WIDTH = 356;

// Viewport padding
const VIEWPORT_OFFSET = "32px";

function getDocumentDirection(): ToasterProps["dir"] {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr";

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as ToasterProps["dir"];
  }

  return dirAttribute as ToasterProps["dir"];
}

const Toast = (props: ToastProps) => {
  const { toast, position } = props;
  const [mounted, setMounted] = React.useState(false);

  const [y, x] = position.split("-");

  React.useEffect(() => {
    // Trigger enter animation without using CSS animation
    setMounted(true);
  }, []);

  return (
    <li
      data-sonner-toast
      data-y-position={y}
      data-x-position={x}
      data-mounted={mounted}
      // TODO Hardcode temporarily
      data-styled={true}
    >
      {toast.title}
    </li>
  );
};

const Toaster = (props: ToasterProps) => {
  const {
    position = "bottom-right",
    offset,
    dir = getDocumentDirection(),
    theme = "light",
  } = props;
  const [toasts, setToasts] = React.useState<ToastT[]>([]);
  const [actualTheme, setActualTheme] = React.useState(
    theme !== "system"
      ? theme
      : typeof window !== "undefined"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : "light"
  );

  const [y, x] = position.split("-");

  React.useEffect(() => {
    return ToastState.subscribe((toast) => {
      setToasts((prevToasts) => {
        return [toast, ...prevToasts];
      });
    });
  }, []);

  React.useEffect(() => {
    if (theme !== "system") {
      setActualTheme(theme);
      return;
    }

    if (theme === "system") {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    }

    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = ({ matches }) => {
      if (matches) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <section>
      <ol
        data-sonner-toaster
        // TODO подбить стили под атрибут dir
        dir={dir === "auto" ? getDocumentDirection() : dir}
        tabIndex={-1}
        data-theme={actualTheme}
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
          <Toast key={toast.id} toast={toast} position={position} />
        ))}
      </ol>
    </section>
  );
};

export { toast, Toaster };
