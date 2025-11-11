"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiHome, FiSearch, FiExternalLink, FiLink, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { signout } from "@/utils/api"; // ⬅️ make sure this exists

const user = {
  user_avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000",
  username: "tajuddinshaik_6",
  name: "Tajuddin Shaik",
  location: "Hyderabad, India",
  bio: "Web Developer | Tech Enthusiast | Lifelong Learner",
  linked_by: 1200,
  linked_to: 300,
  posts: 150,
  isLinked: true,
};

interface NavItemProps {
  Icon: React.ElementType;
  size: number;
  label: string;
  text: string;
  isActive: boolean;
  onClick: () => void;
}

interface NavbarProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}

function NavItem({ Icon, size, label, text, isActive, onClick }: NavItemProps) {
  return (
    <div
      className={`relative flex justify-start items-center p-6 gap-4 cursor-pointer transition-colors w-50 duration-200 rounded-lg m-2 ${
        isActive ? "bg-right-nav-dark" : "hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      {label === "LinkHub" ? (
        <Image
          src={user.user_avatar}
          width={26}
          height={26}
          alt={`${user.username} avatar`}
          className="rounded-full object-cover"
        />
      ) : (
        <Icon className="text-white" size={size} />
      )}
      <div className={`${text} font-montserrat font-bold text-white`}>{label}</div>
    </div>
  );
}

export default function Navbar({ selectedItem, setSelectedItem }: NavbarProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const handleNavClick = (item: string) => {
    if (item === "more") {
      setShowMore((prev) => !prev);
      return;
    }

    setSelectedItem(item);
    setShowMore(false);
    router.push(`/${item.toLowerCase()}`);
  };

  const handleSignout = async () => {
    await signout(); 
    setShowMore(false);
    router.push("/");
  };

  // ✅ Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-[15%] min-h-screen flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Logo */}
        <div>
          <Image src="/logo.png" alt="Logo" width={150} height={150} className="m-4" />
        </div>

        {/* Nav Items */}
        <div className="flex flex-col justify-center items-start">
          <NavItem
            Icon={FiHome}
            size={26}
            label="LiveLinks"
            text="text-1xl"
            isActive={selectedItem === "livelinks"}
            onClick={() => handleNavClick("livelinks")}
          />
          <NavItem
            Icon={FiSearch}
            size={26}
            label="LinkFinder"
            text="text-1xl"
            isActive={selectedItem === "linkfinder"}
            onClick={() => handleNavClick("linkfinder")}
          />
          <NavItem
            Icon={FiLink}
            size={26}
            label="LinkUps"
            text="text-1xl"
            isActive={selectedItem === "linkups"}
            onClick={() => handleNavClick("linkups")}
          />
          <NavItem
            Icon={FiExternalLink}
            size={26}
            label="LinkUpReqs"
            text="text-1xl"
            isActive={selectedItem === "linkupreqs"}
            onClick={() => handleNavClick("linkupreqs")}
          />
          <NavItem
            Icon={FiPlusSquare}
            size={26}
            label="New Link"
            text="text-1xl"
            isActive={selectedItem === "newlink"}
            onClick={() => handleNavClick("newlink")}
          />
          <NavItem
            Icon={HiUserCircle}
            size={26}
            label="LinkHub"
            text="text-1xl"
            isActive={selectedItem === "linkhub"}
            onClick={() => handleNavClick("linkhub")}
          />
        </div>
      </div>

      {/* “More” with popup */}
      <div className="relative" ref={popupRef}>
        <NavItem
          Icon={FiMenu}
          size={26}
          label="More"
          text="text-1xl"
          isActive={selectedItem === "more" || showMore}
          onClick={() => handleNavClick("more")}
        />

        {/* Popup menu */}
        {showMore && (
          <div className="absolute bottom-20 left-4 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-3 w-48 animate-fade-in">
            <div
              onClick={handleSignout}
              className="text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
