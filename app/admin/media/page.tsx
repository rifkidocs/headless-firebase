"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Upload,
  Trash2,
  Loader2,
  Grid,
  List,
  Search,
  Filter,
  X,
  Copy,
  Check,
  Download,
} from "lucide-react";
import NextImage from "next/image";
import clsx from "clsx";
import { toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MediaItem } from "@/lib/types";

type ViewMode = "grid" | "list";
type MediaFilter = "all" | "image" | "video" | "audio" | "document";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    media: MediaItem | null;
  }>({
    open: false,
    media: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch media
  useEffect(() => {
    const q = query(collection(db, "_media"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as MediaItem[];
      setMedia(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter and search media
  const filteredMedia = media.filter((item) => {
    // Filter by type
    if (filter !== "all") {
      if (filter === "document" && item.resourceType !== "raw") return false;
      if (filter === "audio" && item.resourceType !== "raw") return false; // Audio is stored as raw in Cloudinary
      if (filter === "image" && item.resourceType !== "image") return false;
      if (filter === "video" && item.resourceType !== "video") return false;
    }

    // Search by filename or alt
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.publicId.toLowerCase().includes(query) ||
        item.alt?.toLowerCase().includes(query) ||
        item.caption?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "cms-media");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const { data } = await response.json();

        // Save to Firestore
        await addDoc(collection(db, "_media"), {
          publicId: data.publicId,
          url: data.url,
          secureUrl: data.secureUrl,
          resourceType: data.resourceType,
          format: data.format,
          bytes: data.bytes,
          width: data.width,
          height: data.height,
          duration: data.duration,
          folder: data.folder,
          createdAt: serverTimestamp(),
          uploadedBy: "admin", // TODO: Get from auth
        });

        return { success: true, filename: file.name };
      } catch (error) {
        console.error("Upload error:", error);
        return { success: false, filename: file.name, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length > 0) {
      toast.success(`${successful.length} file(s) uploaded successfully!`);
    }
    if (failed.length > 0) {
      toast.error(`${failed.length} file(s) failed to upload`);
    }

    setUploading(false);
  }, []);

  // Handle delete
  const handleDelete = async (item: MediaItem) => {
    setDeleting(true);
    try {
      // Delete from Cloudinary
      await fetch(
        `/api/upload/${encodeURIComponent(item.publicId)}?resourceType=${
          item.resourceType
        }`,
        {
          method: "DELETE",
        }
      );

      // Delete from Firestore
      await deleteDoc(doc(db, "_media", item.id));

      toast.success("File deleted successfully");
      setDeleteDialog({ open: false, media: null });
      if (selectedMedia?.id === item.id) {
        setSelectedMedia(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Get icon for media type
  const getMediaIcon = (item: MediaItem) => {
    if (item.resourceType === "image") return ImageIcon;
    if (item.resourceType === "video") return Video;
    if (item.format === "mp3" || item.format === "wav" || item.format === "ogg")
      return Music;
    return FileText;
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Media Library
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            {media.length} files •{" "}
            {formatSize(media.reduce((sum, m) => sum + m.bytes, 0))} total
          </p>
        </div>
        <label className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 cursor-pointer'>
          <Upload className='w-4 h-4' />
          Upload Files
          <input
            type='file'
            multiple
            className='hidden'
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      <div className='flex gap-6'>
        {/* Main Content */}
        <div className='flex-1'>
          {/* Toolbar */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-6'>
            <div className='p-4 flex flex-wrap gap-4 items-center'>
              {/* Search */}
              <div className='relative flex-1 min-w-[200px]'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search files...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Filter */}
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-400' />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as MediaFilter)}
                  className='text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='all'>All Files</option>
                  <option value='image'>Images</option>
                  <option value='video'>Videos</option>
                  <option value='audio'>Audio</option>
                  <option value='document'>Documents</option>
                </select>
              </div>

              {/* View Mode */}
              <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  onClick={() => setViewMode("grid")}
                  className={clsx(
                    "p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  )}>
                  <Grid className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={clsx(
                    "p-2 transition-colors border-l border-gray-300",
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  )}>
                  <List className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={clsx(
              "bg-white rounded-xl shadow-sm border-2 border-dashed transition-all",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200",
              uploading && "opacity-50 pointer-events-none"
            )}>
            {filteredMedia.length === 0 ? (
              <div className='p-16 flex flex-col items-center justify-center text-center'>
                <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
                  <ImageIcon
                    className='w-8 h-8 text-gray-300'
                    aria-hidden='true'
                  />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                  {searchQuery || filter !== "all"
                    ? "No files found"
                    : "No media uploaded yet"}
                </h3>
                <p className='text-gray-500 max-w-xs mb-6'>
                  {searchQuery || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Drag and drop files here or click upload"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className='p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {filteredMedia.map((item) => {
                  const Icon = getMediaIcon(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={clsx(
                        "group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg",
                        selectedMedia?.id === item.id
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-transparent"
                      )}>
                      {item.resourceType === "image" ? (
                        <NextImage
                          src={item.secureUrl}
                          alt={item.alt || item.publicId || "Media"}
                          fill
                          className='object-cover'
                          sizes='(max-width: 768px) 50vw, 25vw'
                        />
                      ) : item.resourceType === "video" ? (
                        <video
                          src={item.secureUrl}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gray-100 flex flex-col items-center justify-center'>
                          <Icon className='w-12 h-12 text-gray-400 mb-2' />
                          <span className='text-xs text-gray-500 uppercase font-medium'>
                            {item.format}
                          </span>
                        </div>
                      )}
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(item.secureUrl);
                          }}
                          className='p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100'>
                          {copiedUrl === item.secureUrl ? (
                            <Check className='w-4 h-4' />
                          ) : (
                            <Copy className='w-4 h-4' />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ open: true, media: item });
                          }}
                          className='p-2 bg-white rounded-lg text-red-600 hover:bg-red-50'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {filteredMedia.map((item) => {
                  const Icon = getMediaIcon(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={clsx(
                        "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                        selectedMedia?.id === item.id && "bg-blue-50"
                      )}>
                      <div className='w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 shrink-0'>
                        {item.resourceType === "image" ? (
                          <NextImage
                            src={item.secureUrl}
                            alt={item.alt || item.publicId || "Media"}
                            fill
                            className='object-cover'
                            sizes='64px'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Icon className='w-8 h-8 text-gray-400' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 truncate'>
                          {item.publicId.split("/").pop()}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {item.format?.toUpperCase()} •{" "}
                          {formatSize(item.bytes)}
                          {item.width &&
                            item.height &&
                            ` • ${item.width}×${item.height}`}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(item.secureUrl);
                          }}
                          className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
                          {copiedUrl === item.secureUrl ? (
                            <Check className='w-4 h-4 text-green-500' />
                          ) : (
                            <Copy className='w-4 h-4' />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ open: true, media: item });
                          }}
                          className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        {selectedMedia && (
          <div className='w-80 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900'>Details</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Preview */}
            <div className='p-4 border-b border-gray-200'>
              <div className='aspect-video relative rounded-lg overflow-hidden bg-gray-100'>
                {selectedMedia.resourceType === "image" ? (
                  <NextImage
                    src={selectedMedia.secureUrl}
                    alt={selectedMedia.alt || "Media preview"}
                    fill
                    className='object-contain'
                    sizes='320px'
                  />
                ) : selectedMedia.resourceType === "video" ? (
                  <video
                    src={selectedMedia.secureUrl}
                    controls
                    className='w-full h-full'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    {(() => {
                      const Icon = getMediaIcon(selectedMedia);
                      return <Icon className='w-16 h-16 text-gray-400' />;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className='p-4 space-y-3 text-sm'>
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wider mb-1'>
                  Filename
                </p>
                <p className='text-gray-900 font-medium truncate'>
                  {selectedMedia.publicId.split("/").pop()}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <p className='text-gray-500 text-xs uppercase tracking-wider mb-1'>
                    Type
                  </p>
                  <p className='text-gray-900'>
                    {selectedMedia.format?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className='text-gray-500 text-xs uppercase tracking-wider mb-1'>
                    Size
                  </p>
                  <p className='text-gray-900'>
                    {formatSize(selectedMedia.bytes)}
                  </p>
                </div>
              </div>
              {selectedMedia.width && selectedMedia.height && (
                <div>
                  <p className='text-gray-500 text-xs uppercase tracking-wider mb-1'>
                    Dimensions
                  </p>
                  <p className='text-gray-900'>
                    {selectedMedia.width} × {selectedMedia.height}
                  </p>
                </div>
              )}
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wider mb-1'>
                  URL
                </p>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    readOnly
                    value={selectedMedia.secureUrl}
                    className='flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 truncate'
                  />
                  <button
                    onClick={() => copyUrl(selectedMedia.secureUrl)}
                    className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    {copiedUrl === selectedMedia.secureUrl ? (
                      <Check className='w-4 h-4 text-green-500' />
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='p-4 border-t border-gray-200 flex gap-2'>
              <a
                href={selectedMedia.secureUrl}
                download
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'>
                <Download className='w-4 h-4' />
                Download
              </a>
              <button
                onClick={() =>
                  setDeleteDialog({ open: true, media: selectedMedia })
                }
                className='px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'>
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload overlay */}
      {uploading && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-8 flex flex-col items-center'>
            <Loader2 className='w-10 h-10 animate-spin text-blue-600 mb-4' />
            <p className='text-gray-900 font-medium'>Uploading files...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, media: open ? deleteDialog.media : null })
        }
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        confirmText='Delete'
        variant='danger'
        onConfirm={() => {
          if (deleteDialog.media) {
            handleDelete(deleteDialog.media);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}
