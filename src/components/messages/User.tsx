"use client";

import { HiUserCircle } from "react-icons/hi";

interface UserProps {
    username: string;
    name: string;
    onClick?: () => void;
}
export default function User({username, name, onClick} : UserProps) {
    return (
        <div onClick={onClick} className="flex justify-between px-4 py-2">
            <div className="flex gap-2">
                <HiUserCircle size={50} className="text-black dark:text-white"/>
                <div className="flex flex-col">
                    <div className="font-bold text-black dark:text-white">{username}</div>
                    <div className="text-gray-500">{name}</div>
                </div>
            </div>
        </div>
    )
}