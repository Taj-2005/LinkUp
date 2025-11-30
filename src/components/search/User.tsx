"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {IUser} from "@/models/User"
import Image from "next/image";
import LinkUpButton from "../LinkUpButton";

interface UserProps {
    user: IUser | null
}
export default function User({user} : UserProps) {
    const { resolvedTheme } = useTheme();
    const router = useRouter();

    const handleClick = () => {
        router.push(`/linkhub/${user?.username}`)
        return
    }
  return (
    <div 
    onClick={() => handleClick()}
    className="flex justify-between px-8 py-2 hover:scale-103 hover:shadow-lg transition-all duration-300 rounded-2xl items-center">
            <div className="flex gap-2 ">
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 transition-all duration-300">
                  <Image
                      src={ user?.user_avatar ? user.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
                      fill
                      alt={`${user?.username} avatar`}
                      className="object-cover p-0.5 rounded-full"
                      unoptimized
                  />
                </div>
                <div className="flex flex-col">
                    <div className="font-bold text-black dark:text-white">{user?.username}</div>
                    <div className="text-gray-500">{user?.name}</div>
                </div>
            </div>
            <LinkUpButton receiverId={user?._id || ""} />
        </div>
    )
}