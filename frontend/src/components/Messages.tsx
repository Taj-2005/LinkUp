"use client";

import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Chats from "@/components/messages/Chats";
import Chat from "@/components/messages/Chat";

import { FiMessageCircle } from "react-icons/fi";

interface UserProps {
  username: string;
  name: string;
  user_avatar: string;
  isLinked: boolean;
}

export default function Messages() {
  const [user, setUser] = useState<UserProps>({
    username: "",
    name: "",
    user_avatar: "",
    isLinked: false,
  });

  return (
    <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark shadow-md border border-primary-light/30 dark:border-primary-dark/30">
      <div className="w-[30%] border-r border-primary-light/50 dark:border-primary-dark/50 bg-left-nav-light dark:bg-left-nav-dark p-4">
        <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-6 select-none">
          My Links
        </h2>
        <Chats setUser={setUser} />
      </div>

      <div className="w-[70%] bg-right-nav-light dark:bg-right-nav-dark flex flex-col">
        {user.username === "" && user.name === "" ? (
          <div>
          <ToggleSwitch />
          <div className="flex flex-col h-full p-10 justify-center items-center text-center gap-4 text-primary-light dark:text-primary-light/90 select-none mt-20">
            <FiMessageCircle size={100} className="opacity-50" />
            <h3 className="text-2xl font-bold">
              Select a message to view conversation
            </h3>
            <button
              className="mt-4 bg-primary-light dark:bg-primary-dark hover:brightness-110 text-right-nav-light dark:text-right-nav-dark font-semibold rounded-2xl px-8 py-3 shadow-md transition"
              onClick={() => alert("Send message feature coming soon!")}
            >
              Send Message
            </button>
          </div>
          </div>
        ) : (
          <Chat
            username={user.username}
            name={user.name}
            isLinked={user.isLinked}
            user_avatar={user.user_avatar}
          />
        )}
      </div>
    </div>
  );
}
