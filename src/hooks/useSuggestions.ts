import useSWR from "swr";
import { getSuggestions } from "@/utils/api";
import { IUser } from "@/models/User";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function useSuggestions() {
  const pathname = usePathname();
  const shouldFetch = !PUBLIC_ROUTES.includes(pathname);

  const { data, error, isLoading, mutate } = useSWR<{ users: IUser[] }>(
    shouldFetch ? "suggestions-initial" : null,
    getSuggestions,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  return {
    users: data?.users || [],
    isLoading,
    error,
    mutate,
  };
}

