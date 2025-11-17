"use client";

import React from "react";
import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Chats from "@/components/messages/Chats";
import Chat from "@/components/messages/Chat";
import { IUser } from "@/models/User";

import { FiMessageCircle } from "react-icons/fi";

export default function Home() {
  const [user, setUser] = useState<IUser | null>(null);

  const noUserSelected = !user;
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark shadow-md border border-primary-light/30 dark:border-primary-dark/30">
        
        <div className="w-[30%] border-r border-primary-light/50 dark:border-primary-dark/50 bg-left-nav-light dark:bg-left-nav-dark p-4">
          <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-6 select-none">
            My Links
          </h2>
          <Chats setUser={setUser} />
        </div>

        <div className="w-[70%] bg-right-nav-light dark:bg-right-nav-dark flex flex-col">

          {noUserSelected ? (
            <>
              <ToggleSwitch />

              <div className="flex flex-col h-full p-10 justify-center items-center text-center gap-4 text-primary-light dark:text-primary-light/90 select-none mt-20">
                <FiMessageCircle size={100} className="opacity-50" />

                <h3 className="text-2xl font-bold">Select a message to view conversation</h3>

                <button
                  className="mt-4 bg-primary-light dark:bg-primary-dark hover:brightness-110 text-right-nav-light dark:text-right-nav-dark font-semibold rounded-2xl px-8 py-3 shadow-md transition"
                >
                  Send Message
                </button>
              </div>
            </>
          ) : (
            <Chat user={user} />
          )}

        </div>
      </div>
    </div>
  );
}