import useSWR from "swr";
import { IUser } from "@/models/User";
import { getCurrentUser, getAllUsers } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function useUsers() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldFetchAuth = !PUBLIC_ROUTES.includes(pathname);

  const { data: currentUser, mutate: mutateCurrentUser } = useSWR<{ user: IUser }>(
    shouldFetchAuth ? "current-user" : null,
    getCurrentUser,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      onError: (err) => {
        if (err.message.includes("Authentication failed") || err.message.includes("Redirecting")) {
          router.push("/signin");
        }
      }
    }
  );

  const { data: allUsers, mutate: mutateAllUsers } = useSWR<IUser[]>(
    shouldFetchAuth ? "all-users" : null,
    getAllUsers,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      onError: (err) => {
        if (err.message.includes("Authentication failed") || err.message.includes("Redirecting")) {
          router.push("/signin");
        }
      }
    }
  );

  return {
    currentUser: currentUser?.user || null,
    allUsers: allUsers || [],
    mutateCurrentUser,
    mutateAllUsers,
    isLoading: !currentUser && !allUsers && shouldFetchAuth,
  };
}
