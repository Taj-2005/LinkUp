"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import Profile from "@/components/home/Profile";
import Ads from "@/components/Ads";
import Stories from "@/components/home/Stories";
import Post from "@/components/home/Post";
import { useUserStore } from "@/store/useUserStore";
import { useNavbarStore } from "@/store/useNavbarStore";
import { useSocketStore } from "@/store/useSocketStore";

export default function Home() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const setSelectedItem = useNavbarStore((state) => state.setSelectedItem);
  const unseenCount = useSocketStore((state) => state.unseenCount);

  // User data for posts
  const postUser = {
    _id: "691dcfccfbb80b7bc3659700",
    username: "aesthetic",
    name: "Aesthetic",
    location: "Delhi",
    bio: "Photographer",
    user_avatar: "https://res.cloudinary.com/doexqrehm/image/upload/v1763561545/user_avatars/jfv9zazhriy9t24ve5bm.jpg",
  };

  // Post images
  const postImages = [
    "https://images.pexels.com/photos/9454915/pexels-photo-9454915.jpeg",
    "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
    "https://images.pexels.com/photos/8832898/pexels-photo-8832898.jpeg",
    "https://images.pexels.com/photos/10079452/pexels-photo-10079452.jpeg",
  ];

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">

      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-full p-2 max-w-[96vw] md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark overflow-y-auto hide-scrollbar relative">
          <button
            onClick={() => {
              setSelectedItem("linkhub");
              router.push("/linkupreqs");
            }}
            className="md:hidden absolute py-2 top-2 right-2 z-10 text-black dark:text-white hover:opacity-75 transition-opacity"
            aria-label="Notifications"
          >
            <div className="relative">
              <FiBell size={24} />
              {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark"></span>
              )}
            </div>
          </button>
          <div className="pt-6 md:pt-0 pb-4">
            <Stories />
          </div>
          
          {/* Posts Section */}
          <div className="w-full flex flex-col items-center px-2 md:px-4 pb-4">
            {postImages.map((imageUrl, index) => (
              <Post
                key={`post-${index}`}
                user={postUser}
                imageUrl={imageUrl}
              />
            ))}
          </div>
        </div>

        <div className="hidden md:flex w-full md:w-[30%] border-t md:border-t-0 md:border-l border-primary-light/30 dark:border-primary-dark/30 mt-4 md:mt-0 flex-col">

          <div className="flex justify-end items-end m-2 px-4 py-2">
            <button
              onClick={() => {
                setSelectedItem("settings");
                router.push("/linkupreqs");
              }}
              className="text-black dark:text-white hover:opacity-75 transition-opacity flex justify-end items-end relative"
              aria-label="Notifications"
            >
              <FiBell size={30} />
              {unseenCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark"></span>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Profile user={user} />
            <Ads />
          </div>

        </div>
      </div>
    </div>
  );
}
