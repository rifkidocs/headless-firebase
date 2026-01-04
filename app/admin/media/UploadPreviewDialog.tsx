"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Upload,
  File as FileIcon,
  Image as ImageIcon,
  Film,
  Music,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";

interface UploadPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onRemove: (index: number) => void;
  onUpload: () => void;
  uploading: boolean;
}

const PreviewItem = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    let url = "";
    if (file.type.startsWith("image/")) {
      url = URL.createObjectURL(file);
      setPreview(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
      setPreview("");
    };
  }, [file]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type.startsWith("video/")) return Film;
    if (file.type.startsWith("audio/")) return Music;
    return FileIcon;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className='relative group rounded-xl border border-gray-200 bg-gray-50 overflow-hidden aspect-square flex flex-col'>
      <div className='flex-1 relative flex items-center justify-center overflow-hidden'>
        {preview ? (
          <NextImage
            src={preview}
            alt={file.name}
            fill
            className='object-cover'
          />
        ) : (
          (() => {
            const IconComponent = getFileIcon(file);
            return <IconComponent className='w-10 h-10 text-gray-400' />;
          })()
        )}
      </div>

      <div className='p-3 bg-white border-t border-gray-100'>
        <p
          className='text-xs font-medium text-gray-900 truncate'
          title={file.name}>
          {file.name}
        </p>
        <p className='text-[10px] text-gray-500 mt-0.5'>
          {formatSize(file.size)}
        </p>
      </div>

      <button
        onClick={onRemove}
        className='absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50'>
        <Trash2 className='w-4 h-4' />
      </button>
    </div>
  );
};

export function UploadPreviewDialog({
  open,
  onOpenChange,
  files,
  onRemove,
  onUpload,
  uploading,
}: UploadPreviewDialogProps) {
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
                className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col'>
                  {/* Header */}
                  <div className='p-6 pb-4 flex items-center justify-between border-b border-gray-100'>
                    <div>
                      <Dialog.Title className='text-lg font-semibold text-gray-900'>
                        Upload Preview
                      </Dialog.Title>
                      <Dialog.Description className='text-sm text-gray-500 mt-1'>
                        Review {files.length} file
                        {files.length !== 1 ? "s" : ""} before uploading
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button className='p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'>
                        <X className='w-5 h-5' />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* File List */}
                  <div className='p-6 overflow-y-auto min-h-[200px] flex-1'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                      {files.map((file, index) => (
                        <PreviewItem
                          key={`${file.name}-${index}`}
                          file={file}
                          onRemove={() => onRemove(index)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className='p-6 pt-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-100'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        disabled={uploading}
                        className='px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'>
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type='button'
                      onClick={onUpload}
                      disabled={uploading || files.length === 0}
                      className='px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                      {uploading ? (
                        <>
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
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className='w-4 h-4' />
                          Upload {files.length} file
                          {files.length !== 1 ? "s" : ""}
                        </>
                      )}
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
