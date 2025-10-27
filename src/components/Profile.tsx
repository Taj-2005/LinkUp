"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/profile/ProfileNavbar";

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

export default function Profile(){
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
        <div className="flex flex-col gap-8 items-center">
          <ToggleSwitch />
          <ProfileCard user={user} />
          <Navbar user={user.username}/>
        </div>
        </div>
      </div>
    )
}