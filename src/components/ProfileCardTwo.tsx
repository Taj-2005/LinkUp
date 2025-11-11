"use client";

import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { IUserClient } from "@/types/user";

interface ProfileCardProps {
  user: IUserClient;
}


export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Avatar */}
      <div className="flex-shrink-0 relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-primary-light dark:border-primary-dark">
      <Image
        src={user.user_avatar ?? "/profile.png"}
        alt={`${user.name} avatar`}
        fill
        className="object-cover"
      />
      </div>

      {/* User Info */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Username & Name */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-white tracking-tight">
            {user.username}
          </h1>
          <p className="text-primary-light dark:text-primary-light/80 text-lg font-semibold mt-1">
            {user.name}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-center text-primary-dark dark:text-white font-semibold mb-6">
          <div>
            <p className="text-2xl">{user.links}</p>
            <p className="text-sm font-medium text-primary-light dark:text-gray-400">
              Links
            </p>
          </div>
          <div>
            <p className="text-2xl">{user.linked_by}</p>
            <p className="text-sm font-medium text-primary-light dark:text-gray-400">
              Linked By
            </p>
          </div>
          <div>
            <p className="text-2xl">{user.linked_to}</p>
            <p className="text-sm font-medium text-primary-light dark:text-gray-400">
              Linked To
            </p>
          </div>
        </div>

        {/* Location & Bio */}
        <div className="flex flex-col gap-3 max-w-lg">
          <div className="flex items-center gap-2 text-primary-light dark:text-white text-sm md:text-base">
            <FiMapPin className="text-xl" />
            <span>{user.location}</span>
          </div>
          <p className="text-primary-light dark:text-white line-clamp-4 leading-relaxed break-words text-sm md:text-base">
            {user.bio}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-4">
          {user.username === "tajuddinshaik_6" ? (
            <button className="bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition">
              Edit Profile
            </button>
          ) : user.isLinked ? (
            <>
              <button className="bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition">
                Linked
              </button>
              <button className="bg-left-nav-light dark:bg-left-nav-dark border border-primary-light dark:border-primary-dark text-primary-light dark:text-gray-200 px-6 py-2 rounded-2xl font-semibold shadow hover:brightness-110 transition">
                Start LinkUp
              </button>
            </>
          ) : (
            <button className="bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition">
              LinkUp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
