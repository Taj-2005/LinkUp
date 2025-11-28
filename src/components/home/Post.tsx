"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiHeart, FiMessageCircle, FiLink } from "react-icons/fi";
import { FaRegBookmark } from "react-icons/fa";

interface PostUser {
  _id: string;
  username: string;
  name: string;
  location?: string;
  bio?: string;
  user_avatar?: string;
}

interface PostProps {
  user: PostUser;
  imageUrl: string;
}

export default function Post({ user, imageUrl }: PostProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const handleUserClick = () => {
    router.push(`/linkhub/${user.username}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-right-nav-light dark:bg-right-nav-dark rounded-2xl overflow-hidden shadow-lg border border-primary-light/20 dark:border-primary-dark/30 mb-6"
    >
      <div className="flex items-center gap-3 p-4 pb-3">
        <div
          onClick={handleUserClick}
          className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src={
              user.user_avatar
                ? user.user_avatar
                : resolvedTheme === "dark"
                ? "/dark-profile.png"
                : "/light-profile.png"
            }
            fill
            unoptimized
            alt={`${user.username} avatar`}
            className="object-cover"
          />
        </div>
        <div
          onClick={handleUserClick}
          className="flex flex-col flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
        >
          <div className="font-bold text-black dark:text-white text-sm md:text-base truncate">
            {user.username}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm truncate">
            {user.name}
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={`Post by ${user.username}`}
          fill
          unoptimized
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              className="text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label="Like"
            >
              <FiHeart size={24} />
            </button>
            <button
              className="text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label="Comment"
            >
              <FiMessageCircle size={24} />
            </button>
            <button
              className="text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label="LinkUp Share"
            >
              <FiLink size={24} />
            </button>
          </div>
          <button
            className="text-black dark:text-white hover:opacity-70 transition-opacity"
            aria-label="Save Link"
          >
            <FaRegBookmark size={24} />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-black dark:text-white">
              {user.username}
            </span>
            {user.bio && (
              <span className="text-black dark:text-white">
                {user.bio}
              </span>
            )}
          </div>
          {user.location && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              📍 {user.location}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

