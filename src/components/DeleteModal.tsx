"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function DeleteModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Delete Post",
  message = "Are you sure you want to delete this post? This action cannot be undone.",
}: DeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
            style={{ pointerEvents: "auto" }}
          />

          <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:w-auto md:max-w-md md:max-h-[90vh] md:overflow-y-auto flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                minHeight: "min(40vh, 300px)",
                maxHeight: "90vh",
              }}
            >
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base flex-1">
                  {message}
                </p>

                <div className="flex gap-3 md:gap-4 justify-end mt-auto">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancel();
                    }}
                    className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px] flex-1 md:flex-initial touch-manipulation"
                    style={{ touchAction: "manipulation" }}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onConfirm();
                    }}
                    className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 active:from-violet-700 active:via-purple-700 active:to-pink-700 transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px] flex-1 md:flex-initial touch-manipulation"
                    style={{ touchAction: "manipulation" }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

