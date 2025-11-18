"use client";

import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { IUser } from "@/models/User";
import { useTheme } from "next-themes";
import {motion} from "framer-motion"

interface ProfileCardProps {
  user: IUser | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const { resolvedTheme } = useTheme();

if (!user) {
    return (
      <div className="w-full flex items-center justify-center">
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
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      
      <div
        className={`flex-shrink-0 relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-primary-light dark:border-primary-dark`}
      >
        <Image
          src={
            user.user_avatar
              ? user.user_avatar
              : resolvedTheme === "dark"
              ? "/dark-profile.png"
              : "/light-profile.png"
          }
          alt={`${user.name} avatar`}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">

        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-white tracking-tight">
            {user.username}
          </h1>
          <p className="text-primary-light dark:text-primary-light/80 text-lg font-semibold mt-1">
            {user.name}
          </p>
        </div>

        <div className="flex gap-8 text-center text-primary-dark dark:text-white font-semibold mb-6">
          <div>
            <p className="text-2xl">{user.links ? user.links.length : 0}</p>
            <p className="text-sm text-primary-light dark:text-gray-400">
              Links
            </p>
          </div>

          <div>
            <p className="text-2xl">{user.linked_by.length}</p>
            <p className="text-sm text-primary-light dark:text-gray-400">
              Linked By
            </p>
          </div>

          <div>
            <p className="text-2xl">{user.linked_to.length}</p>
            <p className="text-sm text-primary-light dark:text-gray-400">
              Linked To
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-w-lg">
          <div className="flex items-center gap-2 text-primary-light dark:text-white text-sm md:text-base">
            <FiMapPin className="text-xl" />
            <span>{user.location}</span>
          </div>

          <p className="text-primary-light dark:text-white line-clamp-4 leading-relaxed break-words text-sm md:text-base">
            {user.bio}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <button className="bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition">
            LinkUp
          </button>
        </div>

      </div>
    </div>
  );
}
