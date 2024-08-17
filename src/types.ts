export type ExternalToast = Omit<
  ToastT,
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
};

type CnFunction = (...classes: Array<string | undefined>) => string;

export interface ToastT {
  id: string | number;
  title?: string | React.ReactNode;
  description?: React.ReactNode;
  position?: Position;
  onDismiss?: (toast: ToastT) => void;
  closeButton?: boolean;
}

export interface ToastProps {
  toast: ToastT;
  index: number;
  toasts: ToastT[];
  removeToast: (toast: ToastT) => void;
  heights: HeightT[];
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  position?: Position;
  gap?: number;
  className?: string;
  cn: CnFunction;
  style?: React.CSSProperties;
  expandByDefault: boolean;
  visibleToasts: number;
  invert: boolean;
  pauseWhenPageIsHidden: boolean;
  duration?: number;
  closeButton: boolean;
  closeButtonAriaLabel: string;
}

export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToasterProps {
  position?: Position;
  offset?: string | number;
  dir?: "rtl" | "ltr" | "auto";
  theme?: "light" | "dark" | "system";
  gap?: number;
  toastOptions?: ToastOptions;
  cn?: CnFunction;
  style?: React.CSSProperties;
  expand?: boolean;
  visibleToasts?: number;
  invert?: boolean;
  pauseWhenPageIsHidden?: boolean;
  duration?: number;
  closeButton?: boolean;
  closeButtonAriaLabel?: string;
}

export interface HeightT {
  height: number;
  toastId: number | string;
  position: Position;
}

interface ToastOptions {
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  closeButton?: boolean;
}
