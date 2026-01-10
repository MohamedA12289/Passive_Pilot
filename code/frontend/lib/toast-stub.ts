/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
const baseToast = (msg: any, _opts?: any) => {
  if (typeof console !== 'undefined') console.info(msg);
};

export const toast = Object.assign(baseToast, {
  success: (msg: any, _opts?: any) => (typeof console !== 'undefined' ? console.info(msg) : undefined),
  error: (msg: any, _opts?: any) => (typeof console !== 'undefined' ? console.error(msg) : undefined),
  loading: (msg: any, _opts?: any) => {
    if (typeof console !== 'undefined') console.info(msg);
    return 'toast-id';
  },
  dismiss: (_id?: any) => undefined,
  promise: <T>(promise: Promise<T>, _messages: any) => promise,
});

export default toast;
