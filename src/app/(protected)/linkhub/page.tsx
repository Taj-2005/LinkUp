"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const router = useRouter();
  const { currentUser, mutateCurrentUser } = useUsers();
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const [selectedLink, setSelectedLink] = useState<ILink | null>(null);
  const [selectedTab, setSelectedTab] = useState<"links" | "savedlinks">("links");

  // Use SWR hooks for data fetching
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

  const links = selectedTab === "links" ? userLinks : savedLinks;
  const isLoading = selectedTab === "links" ? isLoadingUserLinks : isLoadingSavedLinks;

  const handleLinkClick = (link: ILink) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLink(null);
  };

  const handleLinkUpdated = () => {
    // Refresh links when a link is updated (like, comment, etc.)
    if (selectedTab === "links") {
      mutateUserLinks();
    } else {
      mutateSavedLinks();
    }
    // Refresh current user to get updated savedLinks
    mutateCurrentUser();
  };

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-0 md:m-2 h-full md:h-[98vh] rounded-none md:rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full overflow-y-auto hide-scrollbar pb-20 md:pb-0">
          <div className="flex flex-col gap-4 md:gap-8 items-center w-full p-2 md:p-2">
            {/* Header with Settings */}
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

            {/* Navbar */}
            <ProfileNavbarSelf
              selected={selectedTab}
              onSelectedChange={(tab) => setSelectedTab(tab as "links" | "savedlinks")}
            />

            {/* Links Grid */}
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={isModalOpen}
        link={selectedLink}
        onClose={handleCloseModal}
        onLinkUpdated={handleLinkUpdated}
      />
    </div>
  );
}
