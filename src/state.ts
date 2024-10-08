import {
  ExternalToast,
  PromiseData,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from "./types";

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === "object" &&
    "ok" in data &&
    typeof data.ok === "boolean" &&
    "status" in data &&
    typeof data.status === "number"
  );
};

let toastsCounter = 1;

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;
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

  dismiss = (id?: number | string) => {
    this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
    return id;
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
  promise = async (promise: PromiseT, data: PromiseData) => {
    if (!data) return;

    let id: string | number | undefined = undefined;

    if (data.loading) {
      id = this.create({
        ...data,
        type: "loading",
        message: data.loading,
        description:
          typeof data.description !== "function" ? data.description : undefined,
      });
    }

    const p = promise instanceof Promise ? promise : promise();

    let shouldDismiss = id !== undefined;

    try {
      const response = await p;

      if (data.success) {
        shouldDismiss = false;

        const message =
          typeof data.success === "function"
            ? await data.success(response)
            : data.success;

        const description =
          typeof data.description === "function"
            ? await data.description(response)
            : data.description;
        this.create({ type: "success", message, description });
      } else if (!response.ok && isHttpResponse(response)) {
        shouldDismiss = false;

        const message =
          typeof data.error === "function"
            ? await data.error(`HTTP error! status: ${response.status}`)
            : data.error;
        const description =
          typeof data.description === "function"
            ? await data.description(`HTTP error! status: ${response.status}`)
            : data.description;
        this.create({ type: "error", message, description });
      }
    } catch (error) {
      shouldDismiss = false;

      if (data.error) {
        const message =
          typeof data.error === "function"
            ? await data.error(error)
            : data.error;
        const description =
          typeof data.description === "function"
            ? await data.description(error)
            : data.description;
        this.create({ type: "error", message, description });
      }
    } finally {
      if (shouldDismiss) {
        this.dismiss(id);
        id = undefined;
      }
      data.finally?.();
    }

    return id;
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
  promise: ToastState.promise,
});
