"use client";

import Image from "next/image";
import React from "react";
import { FiMenu, FiHome, FiSearch, FiMessageCircle, FiBell, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";

interface NavItemProps {
    Icon: React.ElementType;
    size: number;
    label: string;
    text: string;
}

function NavItem({Icon, size, label, text} : NavItemProps) {
    return (
        <div className="flex justify-start items-center p-6 gap-4">
            <Icon className="text-white" size={size}/>
            <div className={`${text} font-montserrat font-bold text-white`}>{label}</div>
        </div>
    )
}

export default function Navbar() {
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
                    <NavItem Icon={FiHome} size={26} label="Home" text="text-1xl"/>
                    <NavItem Icon={FiSearch} size={26} label="Search" text="text-1xl"/>
                    <NavItem Icon={FiMessageCircle} size={26} label="Messages" text="text-1xl"/>
                    <NavItem Icon={FiBell} size={26} label="Notifications" text="text-1xl"/>
                    <NavItem Icon={FiPlusSquare} size={26} label="Create" text="text-1xl"/>
                    <NavItem Icon={HiUserCircle} size={26} label="Profile" text="text-1xl"/>
                </div>
            </div>
            <NavItem Icon={FiMenu} size={30} label="More" text="text-2xl"/>
            
        </div>
    )
};