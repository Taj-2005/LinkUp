"use client";

import { useState } from "react";
import users from "@/constants/User";
import User from "@/components/search/User";

export default function Suggestions(){
    const [showAll, setShowAll] = useState(false);
    
    const followingUsers = users.filter(user => user.isFollowing);
    const displayedUsers = showAll ? followingUsers : followingUsers.slice(0, 5);
    
    return (
        <div className="flex flex-col">
            <div className="w-full p-10 flex justify-between">
                <div className="text-gray-500 font-bold">Suggested for you</div>
                <div 
                    className="text-black dark:text-white hover:opacity-75 font-bold cursor-pointer"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Show less" : "See all"}
                </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh] hide-scrollbar">
                {
                    displayedUsers.map((user) => (
                        <User 
                            key={user.username} 
                            username={user.username} 
                            name={user.name} 
                            isFollowing={user.isFollowing}
                        />
                    ))
                }
            </div>
        </div>
    )
}