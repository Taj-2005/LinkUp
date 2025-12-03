"use client";

import { motion } from "framer-motion";
import {
  FiUser,
  FiBell,
  FiShield,
  FiEyeOff,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiTag,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { signout } from "@/utils/api";
import { toast } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const items = [
  { icon: FiUser, label: "Edit Profile", active: true },
  { icon: FiBell, label: "Notifications", soon: true },
  { icon: FiShield, label: "Account Security", soon: true },
  { icon: FiEyeOff, label: "Privacy", soon: true },
  { icon: FiLock, label: "Blocked", soon: true },
  { icon: FiMapPin, label: "Story & Location", soon: true },
  { icon: FiMessageCircle, label: "Messages & Replies", soon: true },
  { icon: FiTag, label: "Tags & Mentions", soon: true },
];

interface SettingsSidebarProps {
  onItemClick?: (label: string) => void;
}

export default function SettingsSidebar({ onItemClick }: SettingsSidebarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignout = async () => {
    try {
      toast.loading("Signing out...");

      await signout();

      toast.dismiss();
      toast.success("Signed out successfully");

      window.location.href = "/";
    } catch (err: unknown) {
      toast.dismiss();
      const message = err instanceof Error ? err.message : "Signout failed";
      toast.error(message);
    }
  };

  const handleThemeToggle = () => {
    if (mounted) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-5 pb-12 md:pb-8">

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="
          p-5 rounded-xl
          bg-[#f5f5f5] dark:bg-black/20
          border border-[#d7d7d7] dark:border-white/10
          shadow-sm
          cursor-not-allowed
        "
      >
        <h3 className="text-[#3E434C] dark:text-white font-semibold text-lg">
          Accounts Centre
        </h3>
        <p className="text-[#606468] dark:text-white/60 text-sm mt-1">
          Coming soon
        </p>
      </motion.div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                if (item.active && onItemClick) {
                  onItemClick(item.label);
                }
              }}
              className={`
                flex items-center justify-between
                px-4 py-3 rounded-lg cursor-pointer select-none
                transition-all shadow-sm
                ${
                  item.active
                    ? "bg-primary-light text-white dark:bg-primary-dark dark:text-white"
                    : "bg-[#ffffff] dark:bg-[#181818] border border-[#dcdcdc] dark:border-white/10 text-[#3E434C] dark:text-white/80"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>

              {item.soon && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs px-2 py-1 rounded-md
                             bg-[#e1e1e1] text-[#3E434C]
                             dark:bg-white/10 dark:text-white/70"
                >
                  Soon
                </motion.span>
              )}
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: items.length * 0.05 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleThemeToggle}
          className="
            flex items-center justify-between
            px-4 py-3 rounded-lg cursor-pointer select-none
            transition-all shadow-sm
            bg-[#ffffff] dark:bg-[#181818] border border-[#dcdcdc] dark:border-white/10
            text-[#3E434C] dark:text-white/80
          "
        >
          <div className="flex items-center gap-3">
            {mounted && (resolvedTheme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />)}
            <span className="font-medium">Theme</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: (items.length + 1) * 0.05 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSignout}
          className="
            flex items-center justify-between
            px-4 py-3 rounded-lg cursor-pointer select-none
            transition-all shadow-sm
            bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600
            dark:bg-pink-600 dark:text-white
          "
        >
          <div className="flex items-center gap-3 ">
            <FiLogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
