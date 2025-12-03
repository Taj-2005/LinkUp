"use client";

import React from "react";
import { useState } from "react";

import Chats from "@/components/messages/Chats";
import Chat from "@/components/messages/Chat";
import { IUser } from "@/models/User";

import { FiMessageCircle } from "react-icons/fi";

export default function Home() {
  const [user, setUser] = useState<IUser | null>(null);

  const noUserSelected = !user;
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark shadow-md border border-primary-light/30 dark:border-primary-dark/30">

        <div className={`w-full md:w-[30%] border-b md:border-b-0 md:border-r border-primary-light/50 dark:border-primary-dark/50 bg-left-nav-light dark:bg-left-nav-dark p-4 overflow-y-auto hide-scrollbar ${noUserSelected ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
          <h2 className="text-lg md:text-xl font-semibold text-primary-dark dark:text-primary-light mb-4 md:mb-6 select-none">
            My Links
          </h2>
          <Chats setUser={setUser} />
        </div>

        <div className={`w-full md:w-[70%] bg-right-nav-light dark:bg-right-nav-dark flex flex-col ${noUserSelected ? 'hidden md:flex' : 'flex'}`}>

          {noUserSelected ? (
            <>
              <div className="flex flex-col h-full p-4 md:p-10 justify-center items-center text-center gap-4 text-primary-light dark:text-primary-light/90 select-none mt-10 md:mt-20">
                <FiMessageCircle size={60} className="md:w-[100px] md:h-[100px] opacity-50" />

                <h3 className="text-lg md:text-2xl font-bold px-4">Select a message to view conversation</h3>

                <button
                  className="mt-4 bg-primary-light dark:bg-primary-dark hover:brightness-110 text-right-nav-light dark:text-right-nav-dark font-semibold rounded-2xl px-6 md:px-8 py-2 md:py-3 shadow-md transition text-sm md:text-base"
                >
                  Send Message
                </button>
              </div>
            </>
          ) : (
            <Chat user={user} onBack={() => setUser(null)} />
          )}

        </div>
      </div>
    </div>
  );
}
