export function isAction(action: Action | React.ReactNode): action is Action {
  return (action as Action).label !== undefined;
}

export type PromiseT = Promise<any> | (() => Promise<any>);

export type PromiseData<ToastData = any> = {
  success?: any;
  error?: any;
  description?: any;
  finally?: any;
  loading?: any;
};

export type ToastTypes =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"
  | "default";

export type ExternalToast = Omit<
  ToastT,
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
};

type CnFunction = (...classes: Array<string | undefined>) => string;

export interface Action {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  actionButtonStyle?: React.CSSProperties;
}

export interface ToastIcons {
  success?: React.ReactNode;
  info?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  loading?: React.ReactNode;
}

export interface ToastClassnames {
  title?: string;
  description?: string;
  content?: string;
  toast?: string;
  default?: string;
  success?: string;
  error?: string;
  info?: string;
  warning?: string;
  icon?: string;
  actionButton?: string;
}

export interface ToastT {
  id: string | number;
  title?: string | React.ReactNode;
  description?: React.ReactNode;
  position?: Position;
  onDismiss?: (toast: ToastT) => void;
  closeButton?: boolean;
  type?: ToastTypes;
  richColors?: boolean;
  className?: string;
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  duration?: number;
  icon?: React.ReactNode;
  action?: Action | React.ReactNode;
  actionButtonStyle?: React.CSSProperties;
  delete?: boolean;
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
  defaultRichColors?: boolean;
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  icons?: ToastIcons;
  actionButtonStyle?: React.CSSProperties;
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
  containerAriaLabel?: string;
  richColors?: boolean;
  icons?: ToastIcons;
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
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  actionButtonStyle?: React.CSSProperties;
}

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}
