"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  Image as ImageIcon,
  X,
  Plus,
  Loader2,
  Video,
  FileText,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import { MediaItem } from "@/lib/types";

interface MediaPickerProps {
  value: MediaItem | MediaItem[] | null;
  onChange: (value: MediaItem | MediaItem[] | null) => void;
  multiple?: boolean;
  accept?: "image" | "video" | "all";
}

export function MediaPicker({
  value,
  onChange,
  multiple = false,
  accept = "all",
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem[]>([]);

  // Fetch media
  useEffect(() => {
    const q = query(collection(db, "_media"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as MediaItem[];

      // Filter by accept type
      const filtered = items.filter((item) => {
        if (accept === "all") return true;
        if (accept === "image") return item.resourceType === "image";
        if (accept === "video") return item.resourceType === "video";
        return true;
      });

      setMedia(filtered);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [accept]);

  const handleOpen = () => {
    if (Array.isArray(value)) {
      setSelected(value);
    } else if (value) {
      setSelected([value]);
    } else {
      setSelected([]);
    }
    setOpen(true);
  };

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelected((prev) => {
        const exists = prev.find((m) => m.id === item.id);
        if (exists) {
          return prev.filter((m) => m.id !== item.id);
        }
        return [...prev, item];
      });
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onChange(selected);
    } else {
      onChange(selected[0] || null);
    }
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((m) => m.id !== id));
    } else {
      onChange(null);
    }
  };

  const getIcon = (item: MediaItem) => {
    if (item.resourceType === "image") return ImageIcon;
    if (item.resourceType === "video") return Video;
    return FileText;
  };

  const selectedItems = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div>
      {/* Preview */}
      <div className='flex flex-wrap gap-3'>
        {selectedItems.map((item) => {
          const Icon = getIcon(item);
          return (
            <div key={item.id} className='relative group'>
              <div className='w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100'>
                {item.resourceType === "image" ? (
                  <NextImage
                    src={item.secureUrl}
                    alt={item.alt || item.publicId || "Media"}
                    fill
                    className='object-cover'
                    sizes='96px'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Icon className='w-8 h-8 text-gray-400' />
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={() => handleRemove(item.id)}
                className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'>
                <X className='w-3 h-3' />
              </button>
            </div>
          );
        })}

        {/* Add button */}
        <button
          type='button'
          onClick={handleOpen}
          className='w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors'>
          <Plus className='w-6 h-6' />
          <span className='text-xs mt-1'>Add</span>
        </button>
      </div>

      {/* Picker Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[80vh] z-50'>
                  <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]'>
                    <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
                      <Dialog.Title className='text-lg font-semibold text-gray-900'>
                        Select Media
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
                          <X className='w-5 h-5' />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4'>
                      {loading ? (
                        <div className='flex items-center justify-center py-12'>
                          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
                        </div>
                      ) : media.length === 0 ? (
                        <div className='text-center py-12'>
                          <ImageIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                          <p className='text-gray-500'>No media files found</p>
                          <p className='text-sm text-gray-400 mt-1'>
                            Upload files in the Media Library first
                          </p>
                        </div>
                      ) : (
                        <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3'>
                          {media.map((item) => {
                            const isSelected = selected.some(
                              (m) => m.id === item.id
                            );
                            const Icon = getIcon(item);
                            return (
                              <button
                                key={item.id}
                                type='button'
                                onClick={() => handleSelect(item)}
                                className={clsx(
                                  "aspect-square relative rounded-lg overflow-hidden border-2 transition-all",
                                  isSelected
                                    ? "border-blue-500 ring-2 ring-blue-500/20"
                                    : "border-transparent hover:border-gray-300"
                                )}>
                                {item.resourceType === "image" ? (
                                  <NextImage
                                    src={item.secureUrl}
                                    alt={item.alt || item.publicId || "Media"}
                                    fill
                                    className='object-cover'
                                    sizes='(max-width: 640px) 25vw, 15vw'
                                  />
                                ) : (
                                  <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                                    <Icon className='w-8 h-8 text-gray-400' />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className='p-4 border-t border-gray-200 flex items-center justify-between'>
                      <p className='text-sm text-gray-500'>
                        {selected.length} selected
                      </p>
                      <div className='flex gap-3'>
                        <Dialog.Close asChild>
                          <button
                            type='button'
                            className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg'>
                            Cancel
                          </button>
                        </Dialog.Close>
                        <button
                          type='button'
                          onClick={handleConfirm}
                          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg'>
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}
