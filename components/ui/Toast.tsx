"use client";

import { Toaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// Re-export Toaster for use in layout
export { Toaster };

interface ToastOptions {
  duration?: number;
  id?: string;
}

const baseStyles = {
  background: "#1e293b",
  color: "#f1f5f9",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.3)",
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-3 max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto border border-slate-700`}
          style={{ padding: "16px" }}>
          <div className='shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center'>
            <CheckCircle className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-slate-100'>{message}</p>
          </div>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className='shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>
      ),
      { duration: options?.duration || 4000, id: options?.id }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-3 max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto border border-red-500/30`}
          style={{ padding: "16px" }}>
          <div className='shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center'>
            <XCircle className='w-5 h-5 text-red-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-slate-100'>{message}</p>
          </div>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className='shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>
      ),
      { duration: options?.duration || 5000, id: options?.id }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-3 max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto border border-amber-500/30`}
          style={{ padding: "16px" }}>
          <div className='shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center'>
            <AlertTriangle className='w-5 h-5 text-amber-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-slate-100'>{message}</p>
          </div>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className='shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>
      ),
      { duration: options?.duration || 4000, id: options?.id }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-3 max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto border border-blue-500/30`}
          style={{ padding: "16px" }}>
          <div className='shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center'>
            <Info className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-slate-100'>{message}</p>
          </div>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className='shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>
      ),
      { duration: options?.duration || 4000, id: options?.id }
    );
  },

  loading: (message: string, options?: ToastOptions) => {
    return hotToast.loading(message, {
      style: baseStyles,
      duration: options?.duration || Infinity,
      id: options?.id,
    });
  },

  dismiss: (id?: string) => {
    if (id) {
      hotToast.dismiss(id);
    } else {
      hotToast.dismiss();
    }
  },

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return hotToast.promise(promise, msgs, {
      style: baseStyles,
    });
  },
};
