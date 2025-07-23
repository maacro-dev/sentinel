
export type ToastId = number;
export type ToastRecord = Omit<ToastOptions, 'id'> & { id: number };
export type ToastType = 'loading' | 'success' | 'error';

export interface ToastOptions {
  id?: number;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ToastProps extends ToastRecord {}
