"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import User from "@/components/messages/User";
import SendText from "@/components/messages/SendText";

interface ChatProps {
  username: string;
  name: string;
  isFollowing: boolean;
}

export default function Chat({ username, name, isFollowing }: ChatProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b border-gray-500">
        <User username={username} name={name} />
        <ToggleSwitch />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
      </div>

      <SendText />
    </div>
  );
}
