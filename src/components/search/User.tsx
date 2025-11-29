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
    <div className="flex justify-between px-8 py-2 hover:bg-right-nav-light dark:hover:bg-gray-700 hover:shadow-sm duration-500 rounded-2xl items-center" onClick={() => handleClick()}>
            <div className="flex gap-2">
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                      src={ user?.user_avatar ? user.user_avatar : resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png"}
                      fill
                      alt={`${user?.username} avatar`}
                      className="object-cover"
                      unoptimized
                  />
                </div>
                <div className="flex flex-col">
                    <div className="font-bold text-black dark:text-white">{user?.username}</div>
                    <div className="text-gray-500">{user?.name}</div>
                </div>
            </div>
            <LinkUpButton receiverId={user?._id || ""} variant="border" />
        </div>
    )
}