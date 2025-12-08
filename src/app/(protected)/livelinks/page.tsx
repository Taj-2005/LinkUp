"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
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
  const globalSelectedLink = useModalStore((state) => state.selectedLink);
  const { links, isLoading, mutate: mutateFeedLinks } = useFeedLinks();
  const [selectedLink, setSelectedLink] = useState<LinkWithUser | null>(null);
  
  const modalLink = globalSelectedLink || selectedLink;

  const memoizedLinks = useMemo(() => links, [links]);
  const setSelectedLinkGlobal = useModalStore((state) => state.setSelectedLink);

  const fetchLinkById = useCallback(async (linkId: string): Promise<LinkWithUser | null> => {
    try {
      const linkInFeed = memoizedLinks.find((l) => l._id.toString() === linkId);
      if (linkInFeed) {
        return linkInFeed;
      }

      if (currentUser?._id) {
        const res = await fetch(`/api/links/user/${currentUser._id}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const userLinks = data.links || [];
          const foundLink = userLinks.find((l: LinkWithUser) => l._id.toString() === linkId);
          if (foundLink) {
            return {
              ...foundLink,
              userInfo: {
                username: currentUser.username,
                user_avatar: currentUser.user_avatar,
                name: currentUser.name,
              },
            } as LinkWithUser;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching link by ID:", error);
      return null;
    }
  }, [memoizedLinks, currentUser]);

  const parseHash = useCallback(() => {
    if (typeof window === "undefined") return { commentId: undefined, replyId: undefined };
    const hash = window.location.hash;
    let commentId: string | undefined;
    let replyId: string | undefined;

    if (hash) {
      const commentMatch = hash.match(/^#comment-(.+)$/);
      if (commentMatch) {
        commentId = commentMatch[1];
      }

      const replyMatch = hash.match(/^#reply-(.+)$/);
      if (replyMatch) {
        replyId = replyMatch[1];
      }
    }

    return { commentId, replyId };
  }, []);

  useEffect(() => {
    const linkId = searchParams?.get("link");
    
    if (!linkId) {
      if (isModalOpen && globalSelectedLink) {
        setIsModalOpen(false);
        setSelectedLinkGlobal(null);
        setSelectedLink(null);
      }
      return;
    }

    if (isModalOpen && globalSelectedLink?._id.toString() === linkId) {
      return;
    }

    const link = memoizedLinks.find((l) => l._id.toString() === linkId);
    
    if (link) {
      setSelectedLinkGlobal(link);
      setSelectedLink(link);
      setIsModalOpen(true);
      
      if (searchParams?.get("link") === linkId) {
        router.replace("/livelinks", { scroll: false });
      }
    } else if (!isLoading) {
      fetchLinkById(linkId).then((fetchedLink) => {
        if (fetchedLink) {
          setSelectedLinkGlobal(fetchedLink);
          setSelectedLink(fetchedLink);
          setIsModalOpen(true);
          
          router.replace("/livelinks", { scroll: false });
        }
      });
    }
  }, [searchParams, memoizedLinks, isLoading, isModalOpen, globalSelectedLink, router, setIsModalOpen, setSelectedLinkGlobal, fetchLinkById]);

  const handleCommentClick = useCallback((link: LinkWithUser) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  }, [setIsModalOpen]);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLink(null);
    setSelectedLinkGlobal(null);

    if (searchParams?.get("link")) {
      router.replace("/livelinks", { scroll: false });
    }
  }, [searchParams, router, setIsModalOpen, setSelectedLinkGlobal]);

  const handleLinkUpdated = useCallback(() => {
    mutateFeedLinks();
    mutateCurrentUser();
  }, [mutateFeedLinks, mutateCurrentUser]);

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">

      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-full max-w-[96vw] md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark flex flex-col h-full overflow-y-auto hide-scrollbar relative">
          <button
            onClick={() => {
              setSelectedItem("linkhub");
              router.push("/notifications");
            }}
            className="md:hidden sticky top-2 right-2 z-10 text-black dark:text-white hover:opacity-75 transition-opacity ml-auto mr-2"
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
          
          <div className="pt-6 md:pt-0 pb-4 px-2">
            <Stories />
          </div>
          
          <div className="px-2 md:px-4 pb-20 md:pb-4">
            <div className="w-full flex flex-col items-center">
              {isLoading ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <FeedLinkSkeleton key={i} />
                  ))}
                </>
              ) : memoizedLinks.length === 0 ? (
                <EmptyState
                  message="No links or posts yet — let's wait until someone posts!"
                  subMessage="Be the first to share a link!"
                />
              ) : (
                memoizedLinks.map((link) => (
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
              
      {modalLink && (
        <PostModal
          isOpen={isModalOpen}
          link={modalLink}
          onClose={handleCloseModal}
          onLinkUpdated={handleLinkUpdated}
          deepLinkCommentId={parseHash().commentId}
          deepLinkReplyId={parseHash().replyId}
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
