import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useUsers } from "./useUsers";
import { getLinkStatus } from "@/utils/linkRequestApi";
import { useSocketStore } from "@/store/useSocketStore";

export type LinkStatus = "none" | "requested" | "pending" | "linked" | "linked-by";

export interface LinkStatusResult {
  status: LinkStatus;
  isLoading: boolean;
  requestId?: string;
}

export function useLinkStatus(targetId: string): LinkStatusResult {
  const { currentUser } = useUsers();
  const socket = useSocketStore((state) => state.socket);
  const [status, setStatus] = useState<LinkStatus>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | undefined>();

  const statusKey = currentUser?._id && targetId
    ? ["link-status", currentUser._id, targetId] as const
    : null;

  const { data, error, mutate: mutateStatus } = useSWR(
    statusKey,
    async () => {
      if (!currentUser || !targetId || currentUser._id === targetId) {
        return { status: "none" as LinkStatus };
      }
      return getLinkStatus(targetId);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      dedupingInterval: 5000,
    }
  );

  useEffect(() => {
    if (!socket || !currentUser || !targetId || currentUser._id === targetId) {
      return;
    }

    const handleLinkUpEvent = (data: { type: string; from: string; to: string }) => {
      const { from, to } = data;

      if (from === targetId || to === targetId || from === currentUser._id || to === currentUser._id) {

        mutateStatus(undefined, { revalidate: true });
      }
    };

    socket.on("linkup", handleLinkUpEvent);
    socket.on("linkup:requested", handleLinkUpEvent);
    socket.on("linkup:accepted", handleLinkUpEvent);
    socket.on("linkup:rejected", handleLinkUpEvent);
    socket.on("linkup:unlinked", handleLinkUpEvent);
    socket.on("global:linkup", handleLinkUpEvent);

    return () => {
      socket.off("linkup", handleLinkUpEvent);
      socket.off("linkup:requested", handleLinkUpEvent);
      socket.off("linkup:accepted", handleLinkUpEvent);
      socket.off("linkup:rejected", handleLinkUpEvent);
      socket.off("linkup:unlinked", handleLinkUpEvent);
      socket.off("global:linkup", handleLinkUpEvent);
    };
  }, [socket, currentUser?._id, targetId, mutateStatus, currentUser]);

  useEffect(() => {
    if (!currentUser || !targetId) {
      setStatus("none");
      setIsLoading(false);
      return;
    }

    if (currentUser._id === targetId) {
      setStatus("none");
      setIsLoading(false);
      return;
    }

    if (error) {

      const linkedTo = currentUser.linked_to || [];
      const linkedBy = currentUser.linked_by || [];

      if (linkedTo.includes(targetId)) {
        setStatus("linked");
      } else if (linkedBy.includes(targetId)) {
        setStatus("linked-by");
      } else {
        setStatus("none");
      }
      setIsLoading(false);
      return;
    }

    if (data !== undefined) {

      const statusValue = typeof data === "object" && data !== null
        ? (data as { status?: string }).status || "none"
        : (data as string) || "none";

      setStatus(statusValue as LinkStatus);

      if (typeof data === "object" && data !== null && "requestId" in data) {
        setRequestId((data as { requestId?: string }).requestId);
      }

      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentUser, targetId, data, error]);

  return {
    status,
    isLoading,
    requestId,
  };
}

export function invalidateLinkStatus(currentUserId: string, targetId: string) {
  mutate(["link-status", currentUserId, targetId]);
  mutate(["link-status", targetId, currentUserId]);
}
