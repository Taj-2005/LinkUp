"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeletePostModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeletePostModal({ onConfirm, onCancel }: DeletePostModalProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Delete Post
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
                        Are you sure you want to delete this post? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 md:gap-4 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            Delete
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

