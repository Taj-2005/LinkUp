"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCard from "@/components/ProfileCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import {useUserStore} from "@/store/useUserStore";
import { IUser } from "@/models/User";

export default function UserProfile() {
  const params = useParams();
  const username = params.username as string;
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearching(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const { users } = useUserStore(); 
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const openModal = useCallback((src: string) => {
    setModalSrc(src);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalSrc(null);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeModal();
  };

  const user = users?.find((u: IUser) => u.username === username) ?? null;


if (!user) {
  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 md:m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col items-center justify-center min-h-[98vh] p-2 md:p-4">

            <AnimatePresence mode="wait">
              {searching ? (
                <div className="w-full flex items-center justify-center pb-64">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row items-center justify-center md:items-start gap-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-primary-light dark:border-primary-dark bg-gray-300 dark:bg-gray-700"
                    >
                      <div className="absolute inset-0 animate-shimmer opacity-60" />
                    </motion.div>
                    <div className="flex-1 flex flex-col justify-between w-full">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-4 space-y-3"
                      >
                        <div className="relative h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                          <div className="absolute inset-0 animate-shimmer opacity-60" />
                        </div>
                        <div className="relative h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                          <div className="absolute inset-0 animate-shimmer opacity-60" />
                        </div>
                      </motion.div>
                      <div className="flex gap-8 text-center mb-6">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="relative h-7 w-10 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                              <div className="absolute inset-0 animate-shimmer opacity-60" />
                            </div>
                            <div className="relative h-4 w-14 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                              <div className="absolute inset-0 animate-shimmer opacity-60" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-3 max-w-lg">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-md" />
                          <div className="relative h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                            <div className="absolute inset-0 animate-shimmer opacity-60" />
                          </div>
                        </motion.div>
                        {[100, 80, 60].map((w, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                            className="relative h-4 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden"
                            style={{ width: `${w}%` }}
                          >
                            <div className="absolute inset-0 animate-shimmer opacity-60" />
                          </motion.div>
                        ))}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="mt-4"
                      >
                        <div className="relative h-10 w-36 bg-gray-300 dark:bg-gray-700 rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 animate-shimmer opacity-60" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              ) : (
<motion.div
  key="notfound"
  className="flex flex-col items-center gap-6 py-20"
  initial={{ opacity: 0, scale: 0.92, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  transition={{ duration: 0.55, ease: "easeOut" }}
>

  <motion.div
    className="relative w-32 h-32 flex items-center justify-center"
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 120, damping: 15 }}
  >
    <motion.div
      className="absolute inset-0 blur-xl opacity-40"
      style={{
        background:
          "radial-gradient(circle at center, rgba(255,200,0,0.4), rgba(255,150,0,0.15), transparent)"
      }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      className="text-[80px] select-none pointer-events-none"
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      🥺
    </motion.div>
  </motion.div>

  <motion.p
    className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    User Not Found
  </motion.p>

  <motion.p
    className="text-base text-gray-600 dark:text-gray-400 max-w-xs text-center leading-relaxed"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.1 }}
  >
    We tried our best but couldn’t locate this profile.
  </motion.p>

  <motion.div
    className="h-1 w-24 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: "6rem", opacity: 1 }}
    transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
  />
</motion.div>


              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 md:m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col gap-4 md:gap-8 items-center p-2 md:p-2">

            <ToggleSwitch />

            <div
              onClick={() => openModal(user.user_avatar || "")}
              onContextMenu={(e) => {
                e.preventDefault();
                openModal(user.user_avatar || "");
              }}
              className="cursor-pointer"
            >
              <ProfileCard user={user} />
            </div>

            <ProfileNavbar />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && modalSrc && (
          <motion.div
            ref={overlayRef}
            onClick={onOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-w-[95vw] max-h-[95vh]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
            >
              <motion.button
                onClick={closeModal}
                className="absolute -top-3 -right-3 z-50 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg p-1.5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-800 dark:text-gray-100"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>

              <motion.img
                src={modalSrc}
                alt="preview"
                className="block max-w-[calc(95vw-2rem)] max-h-[calc(95vh-2rem)] object-contain rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
