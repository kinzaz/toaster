import { ExternalToast, ToastT } from "./types";

let toastsCounter = 1;

class Observer {
  subscribers: Array<(toast: unknown) => void>;
  toasts: Array<ToastT | unknown>;
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

export const toast = Object.assign(basicToast, {});
