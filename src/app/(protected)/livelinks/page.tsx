"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import Profile from "@/components/home/Profile";
import Ads from "@/components/Ads";
import Stories from "@/components/home/Stories";
import LinkCard from "@/components/home/LinkCard";
import PostModal from "@/components/links/PostModal";
import FeedLinkSkeleton from "@/components/links/FeedLinkSkeleton";
import EmptyState from "@/components/links/EmptyState";
import { useUsers } from "@/hooks/useUsers";
import { useFeedLinks } from "@/hooks/useLinks";
import { useNavbarStore } from "@/store/useNavbarStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useModalStore } from "@/store/useModalStore";
import { ILink } from "@/models/Link";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

export default function Home() {
  const { currentUser, mutateCurrentUser } = useUsers();
  const user = currentUser;
  const router = useRouter();
  const setSelectedItem = useNavbarStore((state) => state.setSelectedItem);
  const unseenCount = useSocketStore((state) => state.unseenCount);
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const { links, isLoading, mutate: mutateFeedLinks } = useFeedLinks();
  const [selectedLink, setSelectedLink] = useState<LinkWithUser | null>(null);

  const handleCommentClick = (link: LinkWithUser) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLink(null);
  };

  const handleLinkUpdated = () => {
    // Refresh links when a link is updated (like, comment, etc.)
    mutateFeedLinks();
    mutateCurrentUser();
  };

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">

      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-full max-w-[96vw] md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark flex flex-col h-full overflow-hidden relative">
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
          
          {/* Fixed Stories Section */}
          <div className="flex-shrink-0 pt-6 md:pt-0 pb-4 px-2">
            <Stories />
          </div>
          
          {/* Scrollable Links Section */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-2 md:px-4 pb-20 md:pb-4">
            <div className="w-full flex flex-col items-center">
              {isLoading ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <FeedLinkSkeleton key={i} />
                  ))}
                </>
              ) : links.length === 0 ? (
                <EmptyState
                  message="No links or posts yet — let's wait until someone posts!"
                  subMessage="Be the first to share a link!"
                />
              ) : (
                links.map((link) => (
                  <LinkCard
                    key={link._id.toString()}
                    link={link}
                    onCommentClick={() => handleCommentClick(link)}
                    onLinkUpdated={handleLinkUpdated}
                  />
                ))
              )}
            </div>
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

      {/* Post Modal */}
      {selectedLink && (
        <PostModal
          isOpen={isModalOpen}
          link={selectedLink}
          onClose={handleCloseModal}
          onLinkUpdated={handleLinkUpdated}
        />
      )}
    </div>
  );
}
