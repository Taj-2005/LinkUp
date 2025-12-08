"use client";

import toast, { type Toast } from "react-hot-toast";
import ToastWithAvatar from "@/components/ToastWithAvatar";

interface Actor {
  username: string;
  user_avatar?: string;
  avatar?: string;
  name?: string;
}
    
export function showToastWithAvatar(
  actor: Actor,
  message: string,
  options?: {
    duration?: number;
    id?: string;
    type?: "success" | "error" | "info";
    onClick?: () => void;
  }
) {
  const { duration = 5000, id, type = "success", onClick } = options || {};

  const toastOptions = {
    id,
    duration,
    icon: null, 
  };

  const toastContent = (t?: Toast) => (
    <ToastWithAvatar actor={actor} message={message} t={t} onClick={onClick} />
  );

  switch (type) {
    case "error":
      return toast.error(toastContent, { ...toastOptions, icon: null });
    case "info":
      return toast(toastContent, toastOptions);
    default:    
      return toast(toastContent, toastOptions);
  }
}

export const toastHelpers = {
  commented: (actor: Actor) =>
    showToastWithAvatar(actor, "commented on your link"),
  
  replied: (actor: Actor) =>
    showToastWithAvatar(actor, "replied to your link"),
  
  liked: (actor: Actor) =>
    showToastWithAvatar(actor, "liked your post"),
  
  saved: (actor: Actor) =>
    showToastWithAvatar(actor, "saved your link"),
  
  linkRequestSent: (actor: Actor) =>
    showToastWithAvatar(actor, "sent you a link request"),
  
  linkRequestAccepted: (actor: Actor) =>
    showToastWithAvatar(actor, "accepted your link request"),
  
  linked: (actor: Actor) =>
    showToastWithAvatar(actor, "is now linked with you"),
  
  unlinked: (actor: Actor) =>
    showToastWithAvatar(actor, "unlinked from you"),
  
  uploadedLink: (actor: Actor) =>
    showToastWithAvatar(actor, "uploaded a new link"),
  
  custom: (actor: Actor, message: string, options?: Parameters<typeof showToastWithAvatar>[2]) =>
    showToastWithAvatar(actor, message, options),
};

