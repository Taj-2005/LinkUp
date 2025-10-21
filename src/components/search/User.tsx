"use client";

import { HiUserCircle } from "react-icons/hi";

interface UserProps {
    username: string;
    name: string;
    isFollowing: boolean;
}
export default function User({username, name, isFollowing} : UserProps) {
    return (
        <div className="flex justify-between px-8 py-2">
            <div className="flex gap-2">
                <HiUserCircle size={50} className="text-black dark:text-white"/>
                <div className="flex flex-col">
                    <div className="font-bold text-black dark:text-white">{username}</div>
                    <div className="text-gray-500">{name}</div>
                </div>
            </div>
            <button className="border-2 border-black dark:border-white px-4 rounded-lg hover:bg-white hover:text-black transition-colors w-fit h-fit py-1">
                {isFollowing ? "Following" : "Follow"}
            </button>
        </div>
    )
}