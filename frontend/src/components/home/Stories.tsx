"use client";

import Image from "next/image";

import user from "@/constants/User";

export default function Stories() {
    const filteredUsers = user.filter((u) => u.isLinked);
    return (
<div className="flex flex-row overflow-x-auto hide-scrollbar w-full p-12 gap-8">
  {filteredUsers.slice(0, 20).map((user) => (
    <div
      key={user.username}
      className="flex flex-col items-center flex-shrink-0 text-center"
    >
      <Image
        src={user.user_avatar || "/default-avatar.png"}
        alt={user.username}
        width={100}
        height={100}
        className="rounded-full flex-shrink-0 object-cover border-4 border-primary-dark dark:border-primary-light p-[0.5px]"
        loading="lazy"
      />
      <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-[100px]">
        {user.username}
      </span>
    </div>
  ))}
</div>
    )
}