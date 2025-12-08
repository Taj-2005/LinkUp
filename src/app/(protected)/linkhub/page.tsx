"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSettings } from "react-icons/fi";
import ProfileCardSelf from "@/components/ProfileCardSelf";
import ProfileNavbarSelf from "@/components/profile/ProfileNavbarSelf";
import { useUsers } from "@/hooks/useUsers";
import { useUserLinks, useSavedLinks } from "@/hooks/useLinks";
import { ILink } from "@/models/Link";
import LinkCard from "@/components/links/LinkCard";
import PostModal from "@/components/links/PostModal";
import LinksGridSkeleton from "@/components/links/LinksGridSkeleton";
import EmptyState from "@/components/links/EmptyState";
import { useModalStore } from "@/store/useModalStore";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

function LinkHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, mutateCurrentUser } = useUsers();
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const globalSelectedLink = useModalStore((state) => state.selectedLink);
  const setSelectedLinkGlobal = useModalStore((state) => state.setSelectedLink);
  const [selectedLink, setSelectedLink] = useState<ILink | null>(null);
  const [selectedTab, setSelectedTab] = useState<"links" | "savedlinks">("links");

  const {
    links: userLinks,
    isLoading: isLoadingUserLinks,
    mutate: mutateUserLinks,
  } = useUserLinks(currentUser?._id);

  const {
    links: savedLinks,
    isLoading: isLoadingSavedLinks,
    mutate: mutateSavedLinks,
  } = useSavedLinks();

  const links = useMemo(() => {
    return selectedTab === "links" ? userLinks : savedLinks;
  }, [selectedTab, userLinks, savedLinks]);
  
  const isLoading = selectedTab === "links" ? isLoadingUserLinks : isLoadingSavedLinks;

  const modalLink = globalSelectedLink || selectedLink;

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

    const link = links.find((l) => l._id.toString() === linkId);
    
    if (link) {
      setSelectedLinkGlobal(link);
      setSelectedLink(link);
      setIsModalOpen(true);
      
      if (searchParams?.get("link") === linkId) {
        router.replace("/linkhub", { scroll: false });
      }
    } else if (!isLoading) {
      const otherTabLinks = selectedTab === "links" ? savedLinks : userLinks;
      const linkInOtherTab = otherTabLinks.find((l) => l._id.toString() === linkId);
      
      if (linkInOtherTab) {
        setSelectedLinkGlobal(linkInOtherTab);
        setSelectedLink(linkInOtherTab);
        setIsModalOpen(true);
        router.replace("/linkhub", { scroll: false });
      }
    }
  }, [searchParams, links, isLoading, isModalOpen, globalSelectedLink, router, setIsModalOpen, setSelectedLinkGlobal, selectedTab, userLinks, savedLinks]);

  const handleLinkClick = (link: ILink) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLink(null);
    setSelectedLinkGlobal(null);

    if (searchParams?.get("link")) {
      router.replace("/linkhub", { scroll: false });
    }
  }, [searchParams, router, setIsModalOpen, setSelectedLinkGlobal]);

  const handleLinkUpdated = useCallback(() => {
    if (selectedTab === "links") {
      mutateUserLinks(
        (current: ILink[] | undefined) => current,
        { revalidate: false }
      );
    } else {
      mutateSavedLinks(
        (current: LinkWithUser[] | undefined) => current,
        { revalidate: false }
      );
    }
    mutateCurrentUser();
  }, [selectedTab, mutateUserLinks, mutateSavedLinks, mutateCurrentUser]);

  const handleLinkDeleted = useCallback(() => {
    if (selectedTab === "links") {
      mutateUserLinks(
        (current: ILink[] | undefined) => current,
        { revalidate: false }
      );
    } else {
      mutateSavedLinks(
        (current: LinkWithUser[] | undefined) => current,
        { revalidate: false }
      );
    }
    mutateCurrentUser();
  }, [selectedTab, mutateUserLinks, mutateSavedLinks, mutateCurrentUser]);

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-0 md:m-2 h-full md:h-[98vh] rounded-none md:rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full overflow-y-auto hide-scrollbar pb-20 md:pb-0">
          <div className="flex flex-col gap-4 md:gap-8 items-center w-full p-2 md:p-2">
            <div className="flex justify-end items-end w-full p-4">
              <button
                onClick={() => router.push("/settings")}
                className="text-violet-300 hover:opacity-75 transition-all flex justify-end items-end hover:rotate-90"
                aria-label="Settings"
              >
                <FiSettings size={30} />
              </button>
            </div>

            <ProfileCardSelf />

            <ProfileNavbarSelf
              selected={selectedTab}
              onSelectedChange={(tab) => setSelectedTab(tab as "links" | "savedlinks")}
            />

            <div className="w-full max-w-4xl px-2 md:px-4 pb-4">
              {isLoading ? (
                <LinksGridSkeleton />
              ) : links.length === 0 ? (
                <EmptyState
                  message={
                    selectedTab === "links"
                      ? "No posts yet"
                      : "No saved links yet"
                  }
                  subMessage={
                    selectedTab === "links"
                      ? "Start sharing your moments!"
                      : "Save posts you love to view them later"
                  }
                  showButton={selectedTab === "links"}
                  buttonText="Add a Link"
                  onButtonClick={() => router.push("/newlink")}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {links.map((link) => (
                    <LinkCard
                      key={link._id.toString()}
                      link={link}
                      onClick={() => handleLinkClick(link)}
                      onLinkDeleted={handleLinkDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
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
      <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
        <div className="w-full m-0 md:m-2 h-full md:h-[98vh] rounded-none md:rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
          <div className="w-full overflow-y-auto hide-scrollbar pb-20 md:pb-0">
            <div className="flex flex-col gap-4 md:gap-8 items-center w-full p-2 md:p-2">
              <LinksGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    }>
      <LinkHubContent />
    </Suspense>
  );
}
