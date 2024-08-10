export type ExternalToast = any;

export interface ToastT {
  id: string | number;
  title?: string | React.ReactNode;
  description?: React.ReactNode;
}

export interface ToastProps {
  toast: ToastT;
}
