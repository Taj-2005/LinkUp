"use client";

import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/search/Profile";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import Ads from "@/components/Ads";
import { HiUserCircle } from "react-icons/hi";

const user = {
    user_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000",
    username: "tajuddinshaik_6",
    name: "Tajuddin Shaik",
    location: "Hyderabad, India",
    bio: "Web Developer | Tech Enthusiast | Lifelong LearnerWeb Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner ",
    linked_by: 1200,
    linked_to: 300,
    posts: 150,
    isLinked: true
}

export default function Search(){
    const [username, setUsername] = useState("tajuddinshaik_6");
    const [name, setName] = useState("Taj");
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-[70%] bg-left-nav-light dark:bg-right-nav-dark">
            <div>
                <SearchBar />
            </div>
        </div>
        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch/>
          </div>
          <div className="flex flex-col gap-4">
            <Profile username={user.username} name={user.name} user_avatar={user.user_avatar}/>
            <Ads />
          </div>
        </div>
      </div>
    )
}