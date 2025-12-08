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
      revalidateIfStale: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 2000,
      keepPreviousData: true,
      fallbackData: undefined,
    }
  );

  return {
    notifications: data || [],
    isLoading: isLoading && !data,
    isError: error,
    mutate,
  };
}
