"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  initialImageUrl?: string;
}

export default function ImageUploader({
  onImageUploaded,
  onImageRemoved,
  initialImageUrl,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Sync previewUrl with initialImageUrl prop changes (e.g., when form is reset)
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
    if (!initialImageUrl) {
      setError(null);
    }
  }, [initialImageUrl]);

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = useCallback(async (file: File): Promise<string> => {
    const dataUrl = await fileToDataURL(file);

    const res = await fetch("/api/cloudinary/upload-link-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: dataUrl }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview immediately
      const preview = await fileToDataURL(file);
      setPreviewUrl(preview);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      setPreviewUrl(cloudinaryUrl);
      onImageUploaded(cloudinaryUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded, uploadToCloudinary]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onImageRemoved();
  };

  return (
    <div className="w-full">
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative w-full rounded-2xl border-2 border-dashed transition-all duration-300
          ${
            isDragging
              ? "border-violet-500 bg-violet-50/50 dark:bg-violet-900/20"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
          }
          ${previewUrl ? "border-solid p-2 md:p-3" : "p-6 md:p-8 lg:p-12"}
          ${error ? "border-red-500" : ""}
        `}
      >
        <AnimatePresence>
          {previewUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900"
            >
              <div className="relative w-full flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '500px' }}>
                {previewUrl && (
                  <div className="relative w-full h-full max-h-[500px] md:max-h-[600px]">
                    <Image
                      src={previewUrl}
                      alt="Link preview"
                      fill
                      className="object-contain rounded-xl"
                      sizes="(max-width: 768px) 100vw, 800px"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <div className="text-white font-semibold text-sm md:text-base">Uploading...</div>
                </div>
              )}
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 md:p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
                type="button"
                aria-label="Remove image"
              >
                <FiX className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-full bg-violet-100 dark:bg-violet-900/30">
                <FiImage className="w-6 h-6 md:w-8 md:h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2 px-2">
                Drag and drop your image here
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4 px-2">
                or click to browse
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                <FiUpload className="inline mr-2" size={16} />
                Select Image
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 md:mt-4 px-2">
                PNG, JPG, GIF up to 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

