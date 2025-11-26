"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiMenu, FiHome, FiSearch, FiExternalLink, FiLink, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import {useUserStore} from "@/store/useUserStore"
import SignoutButton from "@/components/SignoutButton";

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
  const user = useUserStore((state) => state.user);

  if (isMobile) {
    return (
      <div
        className={`relative flex flex-col justify-center items-center p-1 md:p-2 cursor-pointer transition-colors duration-200 rounded-lg flex-1 min-w-0 ${
          isActive ? "text-white" : "text-primary-light dark:text-primary-dark"
        }`}
        onClick={onClick}
      >
        {label === "LinkHub" ? (
          <Image
            src={ user?.user_avatar ? user.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
            width={24}
            height={24}
            unoptimized
            alt={`${user?.username} avatar`}
            className={`rounded-full object-cover ${isActive ? "ring-2 ring-white" : ""}`}
          />
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
          <Image
            src={ user?.user_avatar ? user.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
            width={26}
            height={26}
            unoptimized
            alt={`${user?.username} avatar`}
            className="rounded-full object-cover"
          />
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
    { Icon: FiLink, label: "LinkUps", mobileLabel: "Links", item: "linkups" },
    { Icon: FiExternalLink, label: "LinkUpReqs", mobileLabel: "Reqs", item: "linkupreqs" },
    { Icon: FiPlusSquare, label: "New Link", mobileLabel: "New", item: "newlink" },
    { Icon: HiUserCircle, label: "LinkHub", mobileLabel: "Profile", item: "linkhub" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative w-[15%] min-h-screen flex-col justify-between mx-4 bg-primary-light dark:bg-primary-dark">
        <div className="flex flex-col">
          <div>
            <Image src="/logo.png" unoptimized alt="Logo" width={150} height={150} className="m-4 max-w-full h-auto" />
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

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden mobile-navbar-fixed z-[9999] bg-right-nav-light dark:bg-right-nav-dark border-t border-primary-light/30 dark:border-primary-dark/30 shadow-lg">
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
          <div className="relative flex-1 min-w-0" ref={popupRef}>
            <NavItem
              Icon={FiMenu}
              size={22}
              label="More"
              mobileLabel="More"
              text="text-xs"
              isActive={selectedItem === "settings"}
              onClick={() => {
                if (selectedItem === "settings") {
                  setShowMore(!showMore);
                } else {
                  handleNavClick("settings");
                }
              }}
              isMobile={true}
            />
            {showMore && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-right-nav-dark dark:bg-right-nav-dark border border-primary-light/30 dark:border-primary-dark/30 rounded-xl shadow-xl p-3 w-48 animate-fade-in">
                <SignoutButton onSignedOut={() => setShowMore(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
