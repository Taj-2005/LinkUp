"use client";

import Image from "next/image";
import { FiMenu, FiHome, FiSearch, FiMessageCircle, FiBell, FiPlusSquare } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";

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
                    <div className="flex justify-start items-center p-6 gap-4">
                        <FiHome className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Home</div>
                    </div>
                    <div className="flex justify-start items-center p-6 gap-4">
                        <FiSearch className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Search</div>
                    </div>
                    <div className="flex justify-start items-center p-6 gap-4">
                        <FiMessageCircle className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Messages</div>
                    </div>
                    <div className="flex justify-start items-center p-6 gap-4">
                        <FiBell className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Notifications</div>
                    </div>
                    <div className="flex justify-start items-center p-6 gap-4">
                        <FiPlusSquare className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Create</div>
                    </div>
                    <div className="flex justify-start items-center p-6 gap-4">
                        <HiUserCircle className="text-white" size={26}/>
                        <div className="text-1xl font-montserrat font-bold text-white">Profile</div>
                    </div>
                </div>
            </div>
            <div className="flex justify-start items-center p-6 gap-4">
                <FiMenu className="text-white" size={30}/>
                <div className="text-2xl font-montserrat font-bold text-white">More</div>
            </div>
        </div>
    )
}