"use client";

import { HiUserCircle } from "react-icons/hi";

import Image from "next/image";

interface UserProps {
    username: string;
    user_avatar: string;
    name: string;
}

export default function User({username, user_avatar, name} : UserProps) {
    return (
        <div className="flex gap-2 pl-4">
                {
                user_avatar ?
                    <Image
                    src={user_avatar}
                    width={50}
                    height={50}
                    alt={`${username} avatar`}
                    className="rounded-full object-cover"
                    />
                    :
                    <HiUserCircle size={50} className="text-black dark:text-white"/>
                }
            <div className="flex flex-col">
                <div className="font-bold text-black dark:text-white">{username}</div>
                <div className="text-gray-500">{name}</div>
            </div>
        </div>
    )
}