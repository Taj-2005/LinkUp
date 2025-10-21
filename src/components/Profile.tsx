"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import UserCard from "@/components/UserCard";

const user = {
    user_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000",
    username: "tajuddinshaik_6",
    name: "Tajuddin Shaik",
    location: "Hyderabad, India",
    bio: "Web Developer | Tech Enthusiast | Lifelong LearnerWeb Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner Web Developer | Tech Enthusiast | Lifelong Learner ",
    followers: 1200,
    following: 300,
    posts: 150,
}

export default function Profile(){
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col m-2">
            <ToggleSwitch/>
            <UserCard user={user}/>
          </div>
        </div>
      </div>
    )
}