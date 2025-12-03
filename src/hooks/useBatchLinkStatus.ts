import useSWR from "swr";
import { useEffect, useMemo } from "react";
import { getBatchLinkStatus } from "@/utils/linkRequestApi";
import { useUsers } from "./useUsers";
import { LinkStatus } from "./useLinkStatus";
import { useSocketStore } from "@/store/useSocketStore";

export interface BatchLinkStatusResult {
  [userId: string]: {
    status: LinkStatus;
    requestId?: string;
  };
}

export function useBatchLinkStatus(
  userIds: string[],
  options?: {
    enabled?: boolean;
    dedupingInterval?: number;
  }
): {
  statusMap: BatchLinkStatusResult;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<BatchLinkStatusResult | undefined>;
} {
  const { currentUser } = useUsers();
  const enabled = options?.enabled !== false && !!currentUser && userIds.length > 0;

  const validUserIds = userIds
    .filter((id) => id && id.trim().length > 0 && id !== currentUser?._id)
    .slice(0, 1000);

  const sortedIds = [...validUserIds].sort();
  const cacheKey = useMemo(() => {
    return enabled && sortedIds.length > 0
      ? ["batch-link-status", currentUser?._id, sortedIds.join(",")] as const
      : null;
  }, [enabled, sortedIds, currentUser?._id]);

  const { data, error, isLoading, mutate } = useSWR<BatchLinkStatusResult>(
    cacheKey,
    async () => {
      if (!currentUser || validUserIds.length === 0) {
        return {} as BatchLinkStatusResult;
      }
      const result = await getBatchLinkStatus(validUserIds);
      return result as BatchLinkStatusResult;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: options?.dedupingInterval || 5000,
      shouldRetryOnError: true,
    }
  );

  const socket = useSocketStore((state) => state.socket);
  const validUserIdsString = validUserIds.join(",");

  useEffect(() => {
    if (!socket || !currentUser || !cacheKey || validUserIds.length === 0) {
      return;
    }

    const handleLinkUpEvent = (eventData: { from?: string; to?: string; userA?: string; userB?: string }) => {

      let from: string | undefined;
      let to: string | undefined;

      if (eventData.from && eventData.to) {
        from = eventData.from;
        to = eventData.to;
      }

      else if (eventData.userA && eventData.userB) {
        from = eventData.userA;
        to = eventData.userB;
      }

      if (!from || !to) return;

      const affectsBatch = validUserIds.includes(from) || validUserIds.includes(to) ||
                          from === currentUser._id || to === currentUser._id;

      if (affectsBatch) {
        mutate();
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
  }, [socket, currentUser?._id, cacheKey, validUserIdsString, currentUser, mutate, validUserIds]);

  const statusMap: BatchLinkStatusResult = {};
  validUserIds.forEach((userId) => {
    statusMap[userId] = data?.[userId] || { status: "none" };
  });

  return {
    statusMap,
    isLoading: enabled ? isLoading : false,
    error: error as Error | undefined,
    mutate,
  };
}

export function getStatusFromBatch(
  statusMap: BatchLinkStatusResult,
  userId: string
): { status: LinkStatus; requestId?: string } | undefined {
  return statusMap[userId];
}
