"use client";

import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Contacts from "@/components/messages/Contacts";
import Chat from "@/components/messages/Chat";

import {FiMessageCircle} from "react-icons/fi";

interface UserProps {
    username: string;
    name: string;
    isFollowing: boolean;
}

export default function Messages(){
    const [user, setUser] = useState<UserProps>({ username: '', name: '', isFollowing: false });
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-[30%]">
          <Contacts setUser={setUser}/>
        </div>
        <div className="w-[70%] bg-right-nav-light dark:bg-right-nav-dark">
          {
            (user.username === '' && user.name === '') ? 
            <div className="flex flex-col h-full w-full">
              <div className="flex justify-end items-start m-2">
                <ToggleSwitch />
              </div>

              <div className="flex flex-1 flex-col justify-center items-center gap-2">
                <FiMessageCircle size={100} />
                <div className="font-bold text-center">Select a message to view conversation</div>
                <button className="bg-right-nav-dark dark:bg-right-nav-light text-white dark:text-black px-4 py-2 rounded-2xl">
                  Send Message
                </button>
              </div>
            </div>
            :
            <Chat username={user.username} name={user.name} isFollowing={user.isFollowing} />
          }
        </div>
      </div>
    )
}