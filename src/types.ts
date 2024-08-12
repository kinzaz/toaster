export type ExternalToast = any;

export interface ToastT {
  id: string | number;
  title?: string | React.ReactNode;
  description?: React.ReactNode;
  position?: Position;
}

export interface ToastProps {
  toast: ToastT;
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
}
