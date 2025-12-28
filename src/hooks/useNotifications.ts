import useSWR from "swr";
import { INotification } from "@/models/Notification";
import { authFetch } from "@/lib/authFetch";

async function fetchNotifications(): Promise<INotification[]> {
  const response = await authFetch("/api/notifications") as { notifications: INotification[] };
  return response.notifications || [];
}

export function useNotifications() {
  const { data, error, mutate, isLoading } = useSWR<INotification[]>(
    "notifications",
    fetchNotifications,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
      fallbackData: [],
      onError: () => {
      },
    }
  );

  return {
    notifications: data || [],
    isLoading: isLoading && data === undefined,
    isError: error,
    mutate,
  };
}
