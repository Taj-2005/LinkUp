"use client";

import { FiSmile, FiMic, FiImage } from "react-icons/fi";

export default function SendText() {
  return (
    <div className="bg-right-nav-light dark:bg-right-nav-dark p-2 border border-gray-300 rounded-full flex justify-center items-center mx-2 md:mx-4 mb-2">
        <FiSmile className="ml-1 md:ml-2 flex-shrink-0" size={24} />
        <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-1 md:p-2 rounded-full outline-none focus:outline-none focus:ring-0 ml-1 md:ml-2 text-sm md:text-base"
        />
        <div className="flex gap-1 md:gap-2 px-1 md:px-2">
            <FiMic size={20} className="md:w-6 md:h-6 flex-shrink-0" />
            <FiImage size={20} className="md:w-6 md:h-6 flex-shrink-0" />
        </div>
    </div>
  );
}
