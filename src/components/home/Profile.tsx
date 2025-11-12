"use client";


import Image from "next/image";
import { useTheme } from "next-themes";

interface UserProps {
    username: string;
    name: string;
    user_avatar: string;
}

export default function User({username, name, user_avatar} : UserProps) {
    const {resolvedTheme} = useTheme()
    return (
        <div className="flex gap-2 pl-4">
            <Image
            src={user_avatar ? user_avatar : `${resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png" }`}
            width={50}
            height={50}
            alt={`${username} avatar`}
            className="rounded-full object-cover"
            />
            <div className="flex flex-col">
                <div className="font-bold text-black dark:text-white">{username}</div>
                <div className="text-gray-500">{name}</div>
            </div>
        </div>
    )
}