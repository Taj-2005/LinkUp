import { mutate } from "swr";
import { ILink } from "@/models/Link";
import { LinkWithUser } from "@/utils/linkInteractions";

import { safeMergeLinkUpdate } from "./linkCacheUtils";

export function mergeBackendLinkIntoCache(
  optimisticLinkId: string,
  backendLink: ILink | LinkWithUser
): void {
  const backendLinkId = backendLink._id.toString();

  mutate( 
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        const linkId = link._id.toString();
        if (linkId === optimisticLinkId || linkId === backendLinkId) {
          return safeMergeLinkUpdate(link, backendLink as Partial<LinkWithUser>);
        }
        return link;
      });
    },
    { revalidate: false }
  );

  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        const linkId = link._id.toString();
        if (linkId === optimisticLinkId || linkId === backendLinkId) {
          return safeMergeLinkUpdate(link, backendLink as Partial<ILink>);
        }
        return link;
      });
    },
    { revalidate: false }
  );
}

export function getPlaceholderImageUrl(isDark: boolean = false): string {
  return isDark 
    ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231f2937' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E"
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E";
}

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;
  return (
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
}

