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
      shouldRetryOnError: false,
    }
  );

  return {
    notifications: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
