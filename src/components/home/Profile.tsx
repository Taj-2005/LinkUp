"use client";

import { HiUserCircle } from "react-icons/hi";

interface UserProps {
    username: string;
    name: string;
}

export default function User({username, name} : UserProps) {
    return (
        <div className="flex gap-2 pl-4">
            <HiUserCircle size={50} className="text-black dark:text-white"/>
            <div className="flex flex-col">
                <div className="font-bold text-black dark:text-white">{username}</div>
                <div className="text-gray-500">{name}</div>
            </div>
        </div>
    )
}