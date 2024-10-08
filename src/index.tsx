import React, { useRef } from "react";
import { getAsset, Loader } from "./assets";
import { useIsDocumentHidden } from "./hooks";
import { toast, ToastState } from "./state";
import "./styles.css";
import {
  HeightT,
  isAction,
  ToasterProps,
  ToastProps,
  ToastT,
  ToastToDismiss,
} from "./types";

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

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3;

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
    visibleToasts,
    invert: ToasterInvert,
    pauseWhenPageIsHidden,
    duration: durationFromToaster,
    closeButton: closeButtonFromToaster,
    closeButtonAriaLabel = "Close toast",
    defaultRichColors,
    classNames,
    descriptionClassName = "",
    icons,
    actionButtonStyle,
  } = props;
  const toastRef = React.useRef<HTMLLIElement>(null);
  const offset = React.useRef(0);
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [y, x] = position.split("-");
  const isFront = index === 0;
  const duration = React.useMemo(
    () => toast.duration || durationFromToaster || TOAST_LIFETIME,
    [durationFromToaster, toast.duration]
  );
  const heightIndex = React.useMemo(
    () => heights.findIndex((height) => height.toastId === toast.id) || 0,
    [heights, toast.id]
  );
  const isVisible = index + 1 <= visibleToasts;
  const invert = ToasterInvert;
  const closeTimerStartTimeRef = React.useRef(0);
  const remainingTime = useRef(duration);
  const isDocumentHidden = useIsDocumentHidden();
  const toastType = toast.type;
  const toastDescriptionClassname = toast.descriptionClassName || "";
  const toastClassname = toast.className || "";

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

  const closeButton = React.useMemo(
    () => toast.closeButton ?? closeButtonFromToaster,
    [toast.closeButton, closeButtonFromToaster]
  );

  const deleteToast = React.useCallback(() => {
    setRemoved(true);
    setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    setOffsetBeforeRemove(offset.current);

    setTimeout(() => {
      removeToast(toast);
    }, TIME_BEFORE_UNMOUNT);
  }, [toast]);

  React.useEffect(() => {
    if (toast.delete) {
      deleteToast();
    }
  }, [deleteToast, toast.delete]);

  const closeButtonHandler = () => {
    deleteToast();
    toast.onDismiss?.(toast);
  };

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
          { toastId: toast.id, height: newHeight, position: toast.position },
          ...heights,
        ];
      } else {
        return heights.map((height) =>
          height.toastId === toast.id
            ? { ...height, height: newHeight }
            : height
        );
      }
    });
  }, [mounted, toast.title, toast.description, setHeights, toast.id]);

  React.useEffect(() => {
    let timeoutId: number;

    const pauseTimer = () => {
      const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.current;
      remainingTime.current = remainingTime.current - elapsedTime;
    };

    const startTimer = () => {
      closeTimerStartTimeRef.current = new Date().getTime();

      timeoutId = setTimeout(() => {
        deleteToast();
      }, remainingTime.current);
    };

    if (pauseWhenPageIsHidden && isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => clearTimeout(timeoutId);
  }, [
    expandByDefault,
    toast,
    duration,
    deleteToast,
    toastType,
    pauseWhenPageIsHidden,
    isDocumentHidden,
  ]);

  React.useEffect(() => {
    // Trigger enter animation without using CSS animation
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const toastNode = toastRef.current;

    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;

      // Add toast height tot heights array after the toast is mounted
      setInitialHeight(height);
      setHeights((h) => [
        { toastId: toast.id, height, position: toast.position },
        ...h,
      ]);

      return () =>
        setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    }
  }, [setHeights, toast.id]);

  function getLoadingIcon() {
    if (icons?.loading) {
      return (
        <div className="sonner-loader" data-visible={toastType === "loading"}>
          {icons.loading}
        </div>
      );
    }

    return <Loader visible={toastType === "loading"} />;
  }

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
      data-visible={isVisible}
      data-invert={invert}
      data-type={toastType}
      data-rich-colors={toast.richColors ?? defaultRichColors}
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
      className={cn(
        className,
        toastClassname,
        classNames?.toast,
        toast?.classNames?.toast,
        classNames?.default,
        classNames?.[toastType],
        toast?.classNames?.[toastType]
      )}
    >
      {closeButton ? (
        <button
          aria-label={closeButtonAriaLabel}
          onClick={closeButtonHandler}
          data-close-button
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ) : null}

      <>
        {toastType || toast.icon ? (
          <div
            data-icon=""
            className={cn(classNames?.icon, toast?.classNames?.icon)}
          >
            {toast.type === "loading" ? toast.icon || getLoadingIcon() : null}
            {toast.type !== "loading"
              ? toast.icon || icons?.[toastType] || getAsset(toastType)
              : null}
          </div>
        ) : null}

        <div
          data-content=""
          className={cn(classNames?.content, toast?.classNames?.content)}
        >
          <div
            data-title=""
            className={cn(classNames?.title, toast?.classNames?.title)}
          >
            {toast.title}
          </div>
          {toast.description ? (
            <div
              data-description=""
              className={cn(
                descriptionClassName,
                toastDescriptionClassname,
                classNames?.description,
                toast?.classNames?.description
              )}
            >
              {toast.description}
            </div>
          ) : null}
        </div>
        {React.isValidElement(toast.action) ? (
          toast.action
        ) : toast.action && isAction(toast.action) ? (
          <button
            data-button
            data-action
            style={
              toast.actionButtonStyle ||
              actionButtonStyle ||
              toast.action?.actionButtonStyle
            }
            onClick={(event) => {
              if (!isAction(toast.action)) return;
              if (event.defaultPrevented) return;
              toast.action.onClick?.(event);
              deleteToast();
            }}
            className={cn(
              classNames?.actionButton,
              toast?.classNames?.actionButton
            )}
          >
            {toast.action.label}
          </button>
        ) : null}
      </>
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
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    invert,
    pauseWhenPageIsHidden,
    duration,
    closeButton,
    closeButtonAriaLabel,
    containerAriaLabel = "Notifications",
    richColors,
    icons,
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
      if ((toast as ToastToDismiss).dismiss) {
        setToasts((toasts) =>
          toasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t))
        );
        return;
      }

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
    <section aria-label={containerAriaLabel} tabIndex={-1}>
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
            visibleToasts={visibleToasts}
            invert={invert}
            pauseWhenPageIsHidden={pauseWhenPageIsHidden}
            duration={toastOptions?.duration ?? duration}
            closeButton={toastOptions?.closeButton ?? closeButton}
            closeButtonAriaLabel={closeButtonAriaLabel}
            defaultRichColors={richColors}
            classNames={toastOptions?.classNames}
            descriptionClassName={toastOptions?.descriptionClassName}
            icons={icons}
            actionButtonStyle={toastOptions?.actionButtonStyle}
          />
        ))}
      </ol>
    </section>
  );
};

export {
  type Action,
  type ToastClassnames,
  type ToastToDismiss,
} from "./types";
export { toast, Toaster, type ToasterProps, type ToastT };
