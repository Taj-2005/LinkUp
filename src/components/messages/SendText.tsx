"use client";

import { FiSmile, FiMic, FiImage } from "react-icons/fi";

export default function SendText() {
  return (
    <div className="bg-right-nav-light dark:bg-right-nav-dark py-2 px-3 lg:py-0 lg:px-4 border border-gray-300 dark:border-gray-600 rounded-full flex items-center gap-2 lg:gap-3 w-full box-border h-full min-h-[48px] lg:min-h-[56px]">
        <FiSmile className="flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 cursor-pointer" size={24} />
        <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 min-w-0 py-1 lg:py-0 rounded-full outline-none focus:outline-none focus:ring-0 text-sm lg:text-base bg-transparent border-0 h-full"
        />
        <div className="flex gap-2 lg:gap-3 flex-shrink-0 items-center">
            <FiMic size={20} className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 cursor-pointer" />
            <FiImage size={20} className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 cursor-pointer" />
        </div>
    </div>
  );
}
