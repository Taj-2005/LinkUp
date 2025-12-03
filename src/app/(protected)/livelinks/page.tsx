"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { parseDeepLink, scrollToComment, scrollToReply } from "@/utils/deepLinks";
import { ILink } from "@/models/Link";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

function HomeContent() {
  const { currentUser, mutateCurrentUser } = useUsers();
  const user = currentUser;
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSelectedItem = useNavbarStore((state) => state.setSelectedItem);
  const unseenCount = useSocketStore((state) => state.unseenCount);
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const { links, isLoading, mutate: mutateFeedLinks } = useFeedLinks();
  const [selectedLink, setSelectedLink] = useState<LinkWithUser | null>(null);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  useEffect(() => {
    if (isLoading || deepLinkHandled) return;

    const linkId = searchParams?.get("link");
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    if (linkId) {

      const link = links.find((l) => l._id === linkId);
      
      if (link) {

        setSelectedLink(link);
        setIsModalOpen(true);
        setDeepLinkHandled(true);

        router.replace("/livelinks", { scroll: false });
      } else {

        mutateFeedLinks().then(() => {
          const retryLink = links.find((l) => l._id === linkId);
          if (retryLink) {
            setSelectedLink(retryLink);
            setIsModalOpen(true);
            setDeepLinkHandled(true);
            if (hash) {
              setTimeout(() => {
                const parsed = parseDeepLink(window.location.href);
                if (parsed.commentId) {
                  scrollToComment(parsed.commentId);
                } else if (parsed.replyId) {
                  scrollToReply(parsed.replyId);
                }
              }, 300);
            }
            router.replace("/livelinks", { scroll: false });
          }
        });
      }
    }
  }, [searchParams, links, isLoading, isModalOpen, deepLinkHandled, router, setIsModalOpen, mutateFeedLinks]);

  const handleCommentClick = useCallback((link: LinkWithUser) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLink(null);
    setDeepLinkHandled(false);

    if (searchParams?.get("link")) {
      router.replace("/livelinks", { scroll: false });
    }
  }, [searchParams, router, setIsModalOpen]);

  const handleLinkUpdated = useCallback(() => {

    mutateFeedLinks();
    mutateCurrentUser();
  }, [mutateFeedLinks, mutateCurrentUser]);

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">

      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-full max-w-[96vw] md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark flex flex-col h-full overflow-hidden relative">
          <button
            onClick={() => {
              setSelectedItem("linkhub");
              router.push("/notifications");
            }}
            className="md:hidden absolute py-2 top-2 right-2 z-10 text-black dark:text-white hover:opacity-75 transition-opacity"
            aria-label="Notifications"
          >
            <div className="relative">
              <FiBell size={24} />
              {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark flex items-center justify-center px-1 text-xs font-bold text-white">
                {unseenCount > 99 ? '99+' : unseenCount}
              </span>
              )}
            </div>
          </button>
          
          {}
          <div className="flex-shrink-0 pt-6 md:pt-0 pb-4 px-2">
            <Stories />
          </div>
          
          {}
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
                router.push("/notifications");
              }}
              className="text-black dark:text-white hover:opacity-75 transition-opacity flex justify-end items-end relative"
              aria-label="Notifications"
            >
              <FiBell size={30} />
              {unseenCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark flex items-center justify-center px-1 text-xs font-bold text-white">
                {unseenCount > 99 ? '99+' : unseenCount}
              </span>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Profile user={user} />
            <Ads />
          </div>

        </div>
      </div>

      {}
      {selectedLink && (
        <PostModal
          isOpen={isModalOpen}
          link={selectedLink}
          onClose={handleCloseModal}
          onLinkUpdated={handleLinkUpdated}
          deepLinkCommentId={(() => {
            if (typeof window === "undefined") return undefined;
            const hash = window.location.hash;
            const match = hash.match(/^#comment-(.+)$/);
            return match ? match[1] : undefined;
          })()}
          deepLinkReplyId={(() => {
            if (typeof window === "undefined") return undefined;
            const hash = window.location.hash;
            const match = hash.match(/^#reply-(.+)$/);
            return match ? match[1] : undefined;
          })()}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
        <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
          <div className="w-full max-w-[96vw] md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark flex flex-col h-full overflow-hidden relative">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-2 md:px-4 pb-20 md:pb-4">
              <div className="w-full flex flex-col items-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <FeedLinkSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
