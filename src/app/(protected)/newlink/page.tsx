"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiType } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ImageUploader from "@/components/links/ImageUploader";

export default function NewLinkPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleImageRemoved = () => {
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          description: description.trim(),
          location: location.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create link");
      }

      toast.success("Link created successfully!");

      setImageUrl(null);
      setDescription("");
      setLocation("");
      router.push(`/linkhub`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col overflow-hidden bg-left-nav-light dark:bg-right-nav-dark">
        <div className="w-full overflow-y-auto hide-scrollbar p-4 md:p-6 pb-24 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mb-6">
              Create New Link
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm md:text-base font-semibold text-primary-dark dark:text-primary-light mb-2">
                  Image *
                </label>
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  initialImageUrl={imageUrl || undefined}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm md:text-base font-semibold text-primary-dark dark:text-primary-light mb-2"
                >
                  <FiType className="inline mr-2" />
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a caption..."
                  maxLength={2200}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm md:text-base"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                  {description.length}/2200
                </p>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm md:text-base font-semibold text-primary-dark dark:text-primary-light mb-2"
                >
                  <FiMapPin className="inline mr-2" />
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-primary-dark dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl || isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {isSubmitting ? "Creating..." : "Create Link"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        </div>
    </div>
  );
}
