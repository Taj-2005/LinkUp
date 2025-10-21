"use client";

import Image from "next/image";
import React, { useState } from "react";
import { FiMenu, FiHome, FiSearch, FiMessageCircle, FiBell, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";

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

function NavItem({Icon, size, label, text, isActive, onClick} : NavItemProps) {
    return (
        <div 
            className={`flex justify-start items-center p-6 gap-4 cursor-pointer transition-colors w-50 duration-200 rounded-lg m-2 ${
                isActive ? 'bg-right-nav-dark' : 'hover:bg-gray-800'
            }`}
            onClick={onClick}
        >
            <Icon 
                className="text-white" 
                size={size}
            />
            <div className={`${text} font-montserrat font-bold text-white`}>
                {label}
            </div>
        </div>
    )
}

export default function Navbar({selectedItem, setSelectedItem} : NavbarProps) {

    const handleNavClick = (label: string) => {
        setSelectedItem(label);
    };

    return (
        <div className="w-[15%] min-h-screen flex flex-col justify-between">
            <div className="flex flex-col">
                <div>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={150}
                        height={150}
                        className="m-4"
                    />
                </div>
                <div className="flex flex-col justify-center items-start">
                    <NavItem 
                        key={"home"}
                        Icon={FiHome} 
                        size={26} 
                        label="Home" 
                        text="text-1xl"
                        isActive={selectedItem === "Home"}
                        onClick={() => handleNavClick("Home")}
                    />
                    <NavItem 
                        key="search"
                        Icon={FiSearch} 
                        size={26} 
                        label="Search" 
                        text="text-1xl"
                        isActive={selectedItem === "Search"}
                        onClick={() => handleNavClick("Search")}
                    />
                    <NavItem 
                        key="messages"
                        Icon={FiMessageCircle} 
                        size={26} 
                        label="Messages" 
                        text="text-1xl"
                        isActive={selectedItem === "Messages"}
                        onClick={() => handleNavClick("Messages")}
                    />
                    <NavItem 
                        key="notifications"
                        Icon={FiBell} 
                        size={26} 
                        label="Notifications" 
                        text="text-1xl"
                        isActive={selectedItem === "Notifications"}
                        onClick={() => handleNavClick("Notifications")}
                    />
                    <NavItem 
                        key="create"
                        Icon={FiPlusSquare} 
                        size={26} 
                        label="Create" 
                        text="text-1xl"
                        isActive={selectedItem === "Create"}
                        onClick={() => handleNavClick("Create")}
                    />
                    <NavItem 
                        key="profile"
                        Icon={HiUserCircle} 
                        size={26} 
                        label="Profile" 
                        text="text-1xl"
                        isActive={selectedItem === "Profile"}
                        onClick={() => handleNavClick("Profile")}
                    />
                </div>
            </div>
            <NavItem 
                key="more"
                Icon={FiMenu} 
                size={30} 
                label="More" 
                text="text-2xl"
                isActive={selectedItem === "More"}
                onClick={() => handleNavClick("More")}
            />
        </div>
    )
}