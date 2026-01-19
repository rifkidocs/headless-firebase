"use client";

import { ReactNode, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface StrictConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  expectedValue: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  children?: ReactNode;
}

export function StrictConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  expectedValue,
  onConfirm,
  loading = false,
  children,
}: StrictConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    setIsMatch(inputValue === expectedValue);
  }, [inputValue, expectedValue]);

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (isMatch) {
      await onConfirm();
    }
  };

  const iconMap = {
    danger: <Trash2 className='w-6 h-6' />,
    warning: <AlertTriangle className='w-6 h-6' />,
    info: <Info className='w-6 h-6' />,
  };

  const colorMap = {
    danger: {
      bg: "bg-red-500/10",
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500/20",
    },
    warning: {
      bg: "bg-amber-500/10",
      icon: "text-amber-500",
      button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20",
    },
    info: {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20",
    },
  };

  const colors = colorMap[variant];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50'
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.3 }}
                className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden'>
                  {/* Header */}
                  <div className='p-6 pb-0 flex items-start gap-4'>
                    <div className={clsx("p-3 rounded-xl", colors.bg)}>
                      <span className={colors.icon}>{iconMap[variant]}</span>
                    </div>
                    <div className='flex-1 pt-1'>
                      <Dialog.Title className='text-lg font-semibold text-gray-900'>
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description className='text-sm text-gray-500 mt-1'>
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button className='p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-2'>
                        <X className='w-5 h-5' />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Input area */}
                  <div className='px-6 py-4 space-y-3'>
                    <p className='text-sm text-gray-600'>
                      Please type <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1 rounded">{expectedValue}</span> to confirm.
                    </p>
                    <input
                      type="text"
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Type "${expectedValue}" to confirm`}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm'
                    />
                  </div>

                  {/* Custom content */}
                  {children && <div className='px-6 pb-4'>{children}</div>}

                  {/* Footer */}
                  <div className='p-6 pt-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-100'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        disabled={loading}
                        className='px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50'>
                        {cancelText}
                      </button>
                    </Dialog.Close>
                    <button
                      type='button'
                      onClick={handleConfirm}
                      disabled={loading || !isMatch}
                      className={clsx(
                        "px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                        colors.button
                      )}>
                      {loading && (
                        <svg
                          className='animate-spin h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                      )}
                      {confirmText}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
