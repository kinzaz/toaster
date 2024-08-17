import { ExternalToast, ToastT, ToastTypes } from "./types";

let toastsCounter = 1;

class Observer {
  subscribers: Array<(toast: ExternalToast | unknown) => void>;
  toasts: Array<ToastT>;
  constructor() {
    this.subscribers = [];
    this.toasts = [];
  }

  subscribe(subscriber: (toast: ToastT) => void) {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  }

  publish(data: ToastT) {
    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  addToast(data: ToastT) {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  }

  create = (
    data: ExternalToast & {
      message?: string | React.ReactNode;
      type?: ToastTypes;
    }
  ) => {
    const { message, type, ...rest } = data;
    const id =
      typeof data?.id === "number" || data.id?.length > 0
        ? data.id
        : toastsCounter++;
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id;
    });

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message });
          return {
            ...toast,
            ...data,
            id,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, type, id, ...rest });
    }

    return id;
  };

  message = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message });
  };

  error = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message, type: "error" });
  };

  success = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: "success", message });
  };

  info = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: "info", message });
  };

  warning = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: "warning", message });
  };

  loading = (message: string | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: "loading", message });
  };
}

export const ToastState = new Observer();

const toastFunction = (
  message: string | React.ReactNode,
  data?: ExternalToast
) => {
  const id = data?.id || toastsCounter++;

  ToastState.addToast({
    title: message,
    ...data,
    id,
  });
  return id;
};

const basicToast = toastFunction;

export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  message: ToastState.message,
  loading: ToastState.loading,
});
