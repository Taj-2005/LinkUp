"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiMenu, FiHome, FiSearch, FiLink, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";
import SignoutButton from "@/components/SignoutButton";
import { motion } from "framer-motion";

interface NavItemProps {
  Icon: React.ElementType;
  size: number;
  label: string;
  mobileLabel?: string;
  text: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

interface NavbarProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}

function NavItem({ Icon, size, label, mobileLabel, text, isActive, onClick, isMobile = false }: NavItemProps) {
  const { resolvedTheme } = useTheme();
  const { currentUser } = useUsers();

  if (isMobile) {
    return (
      <div
        className={`relative flex flex-col justify-center items-center p-1 md:p-2 cursor-pointer transition-colors duration-200 rounded-lg flex-1 min-w-0 ${
          isActive ? "text-white" : "text-primary-light dark:text-primary-dark"
        }`}
        onClick={onClick}
      >
        {label === "LinkHub" ? (
          <div className={`relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ${isActive ? "ring-2 ring-white" : ""}`}>
            <Image
              src={ currentUser?.user_avatar ? currentUser.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
              fill
              unoptimized
              alt={`${currentUser?.username} avatar`}
              className="object-cover"
            />
          </div>
        ) : (
          <Icon size={size} />
        )}
        <span className="text-[10px] md:text-xs font-outfit font-medium mt-0.5 md:mt-1 truncate w-full text-center">{mobileLabel || label}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex justify-start items-center p-6 gap-4 cursor-pointer transition-colors w-50 duration-200 rounded-lg m-2 ${
        isActive ? "bg-right-nav-dark dark:bg-right-nav-dark" : "hover:bg-primary-dark dark:hover:bg-primary-light"
      }`}
      onClick={onClick}
    >
      {label === "LinkHub" ? (
          <div className="relative w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={ currentUser?.user_avatar ? currentUser.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
              fill
              unoptimized
              alt={`${currentUser?.username} avatar`}
              className="object-cover"
            />
          </div>
      ) : (
        <Icon className="text-white dark:text-white" size={size} />
      )}
      <div className={`${text} font-outfit font-medium text-white dark:text-white`}>{label}</div>
    </div>
  );
}

export default function Navbar({ selectedItem, setSelectedItem }: NavbarProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const handleNavClick = (item: string) => {
    setSelectedItem(item);
    router.push(`/${item.toLowerCase()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { Icon: FiHome, label: "LiveLinks", mobileLabel: "Home", item: "livelinks" },
    { Icon: FiSearch, label: "LinkFinder", mobileLabel: "Search", item: "linkfinder" },
    { Icon: FiPlusSquare, label: "New Link", mobileLabel: "New", item: "newlink" },
    { Icon: FiLink, label: "LinkUps", mobileLabel: "Links", item: "linkups" },
    { Icon: HiUserCircle, label: "LinkHub", mobileLabel: "Profile", item: "linkhub" },
  ];

  return (
    <>
      <div className="hidden md:flex relative w-[15%] min-h-screen flex-col justify-between mx-4 bg-primary-light dark:bg-primary-dark">
        <div className="flex flex-col">
          <div className="m-4">
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cursor-pointer"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Image src="/logo.png" unoptimized alt="Logo" width={150} height={150} className="max-w-full h-auto" />
            </motion.a>
          </div>

          <div className="flex flex-col justify-center items-start">
            {navItems.map(({ Icon, label, item }) => (
              <NavItem
                key={item}
                Icon={Icon}
                size={20}
                label={label}
                text="text-1xl"
                isActive={selectedItem === item}
                onClick={() => handleNavClick(item)}
              />
            ))}
          </div>
        </div>

        <div className="relative" ref={popupRef}>
          <NavItem
            Icon={FiMenu}
            size={20}
            label="More"
            text="text-1xl"
            isActive={selectedItem === "settings"}
            onClick={() => handleNavClick("settings")}
          />

          {showMore && (
            <div className="absolute bottom-20 left-4 bg-right-nav-dark dark:bg-right-nav-dark border border-primary-light/30 dark:border-primary-dark/30 rounded-xl shadow-xl p-3 w-48 animate-fade-in">
              <SignoutButton onSignedOut={() => setShowMore(false)} />
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden mobile-navbar-fixed">
        <div className="flex justify-around items-center px-1 py-1.5">
          {navItems.map(({ Icon, label, mobileLabel, item }) => (
            <NavItem
              key={item}
              Icon={Icon}
              size={22}
              label={label}
              mobileLabel={mobileLabel}
              text="text-xs"
              isActive={selectedItem === item}
              onClick={() => handleNavClick(item)}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    </>
  );
}
