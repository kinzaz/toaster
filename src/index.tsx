import React from "react";
import { toast, ToastState } from "./state";
import "./styles.css";
import { HeightT, ToasterProps, ToastProps, ToastT } from "./types";

// Default toast width
const TOAST_WIDTH = 356;

// Viewport padding
const VIEWPORT_OFFSET = "32px";

// Equal to exit animation duration
const TIME_BEFORE_UNMOUNT = 400;

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000;

// Default gap between toasts
const GAP = 14;

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

function _cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const Toast = (props: ToastProps) => {
  const {
    toast,
    position,
    removeToast,
    index,
    toasts,
    heights,
    setHeights,
    gap,
    className = "",
    style,
    cn,
    expandByDefault,
  } = props;
  const toastRef = React.useRef<HTMLLIElement>(null);
  const offset = React.useRef(0);
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [y, x] = position.split("-");
  const isFront = index === 0;
  const duration = TOAST_LIFETIME;
  const heightIndex = React.useMemo(
    () => heights.findIndex((height) => height.toastId === toast.id) || 0,
    [heights, toast.id]
  );

  const toastsHeightBefore = React.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current  toast
      if (reducerIndex >= heightIndex) {
        return prev;
      }

      return prev + curr.height;
    }, 0);
  }, [heights, heightIndex]);

  offset.current = React.useMemo(
    () => heightIndex * gap + toastsHeightBefore,
    [heightIndex, toastsHeightBefore]
  );

  const deleteToast = React.useCallback(() => {
    setRemoved(true);
    setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    setOffsetBeforeRemove(offset.current);

    setTimeout(() => {
      removeToast(toast);
    }, TIME_BEFORE_UNMOUNT);
  }, [toast]);

  React.useLayoutEffect(() => {
    if (!mounted) return;

    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = "auto";

    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;

    setInitialHeight(newHeight);

    setHeights((heights) => {
      const alreadyExists = heights.find(
        (height) => height.toastId === toast.id
      );

      if (!alreadyExists) {
        return [
          {
            toastId: toast.id,
            height: newHeight,
            position: toast.position,
          },
          ...heights,
        ];
      }
    });
  }, [mounted, toast.id]);

  React.useEffect(() => {
    let timeoutId: number;
    let remainingTime = duration;

    const startTimer = () => {
      timeoutId = setTimeout(() => {
        deleteToast();
      }, remainingTime);
    };

    startTimer();

    return () => clearTimeout(timeoutId);
  }, [toast, deleteToast]);

  React.useEffect(() => {
    // Trigger enter animation without using CSS animation
    setMounted(true);
  }, []);

  return (
    <li
      ref={toastRef}
      data-sonner-toast
      data-y-position={y}
      data-x-position={x}
      data-mounted={mounted}
      data-removed={removed}
      data-front={isFront}
      data-expanded={Boolean(expandByDefault && mounted)}
      // TODO Hardcode temporarily
      data-styled={true}
      style={
        {
          "--z-index": toasts.length - index,
          "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
          "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
          "--toasts-before": index,
          ...style,
        } as React.CSSProperties
      }
      className={cn(className)}
    >
      <span>{toast.title}</span>
    </li>
  );
};

const Toaster = (props: ToasterProps) => {
  const {
    position = "bottom-right",
    offset,
    dir = getDocumentDirection(),
    theme = "light",
    gap = GAP,
    toastOptions,
    cn = _cn,
    expand,
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
  const [heights, setHeights] = React.useState<HeightT[]>([]);

  const [y, x] = position.split("-");

  const removeToast = React.useCallback(
    (toastToRemove: ToastT) =>
      setToasts((toasts) => toasts.filter(({ id }) => id !== toastToRemove.id)),
    []
  );

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
            "--front-toast-height": `${heights[0]?.height || 0}px`,
            "--gap": `${gap}px`,
          } as React.CSSProperties
        }
      >
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            toast={toast}
            position={position}
            removeToast={removeToast}
            index={index}
            toasts={toasts}
            heights={heights}
            setHeights={setHeights}
            gap={gap}
            className={toastOptions?.className}
            cn={cn}
            style={toastOptions?.style}
            expandByDefault={expand}
          />
        ))}
      </ol>
    </section>
  );
};

export { toast, Toaster };
