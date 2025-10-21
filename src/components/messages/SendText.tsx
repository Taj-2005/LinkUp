"use client";

import { FiSmile, FiMic, FiImage } from "react-icons/fi";

export default function SendText() {
  return (
    <div className="p-2 border border-gray-300 rounded-full flex justify-center items-center mx-4 mb-2">
        <FiSmile className="ml-2" size={30}/>
        <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 rounded-full outline-none focus:outline-none focus:ring-0 ml-2"
        />
        <div className="flex gap-2 px-2">
            <FiMic size={24}/>
            <FiImage size={24}/>
        </div>
    </div>
  );
}
