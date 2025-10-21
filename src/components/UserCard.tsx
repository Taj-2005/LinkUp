"use client";

import Image from "next/image";
import {FiMapPin} from "react-icons/fi";

interface UserCardProps{
    user: {
        user_avatar: string;
        username: string;
        name: string;
        location: string;
        bio: string;
        posts: number;
        followers: number;
        following: number;
        isFollowing?: boolean;
    }
}

export default function ProfileCard({user} : UserCardProps){
    return(
        <div className="flex flex-col">
            <div className="flex justify-center gap-4">
                <Image
                    src={user.user_avatar}
                    alt="User Avatar"
                    width={150}
                    height={150}
                    className="rounded-full m-4"
                />
                <div className="flex flex-col justify-center max-w-[40vw]">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-black dark:text-white">{user.username}</h1>
                            <div>{user.name}</div>
                        </div>
                        <div className="flex gap-4">
                            <div><span className="font-bold">{user.posts}</span> posts</div>
                            <div><span className="font-bold">{user.followers}</span> followers</div>
                            <div><span className="font-bold">{user.following}</span> follwing</div>
                        </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center"><FiMapPin /> {user.location}</div>
                        <div className="line-clamp-2">{user.bio}</div>
                    </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center">
                {
                    user.username === 'tajuddinshaik_6' ?
                    <div>
                        <button className="bg-right-nav-dark dark:bg-right-nav-light text-right-nav-light dark:text-right-nav-dark px-4 py-2 rounded-2xl">Edit Profile</button>
                    </div>
                    :
                    user.isFollowing ? 
                    <div>
                        <button className="bg-right-nav-dark dark:bg-right-nav-light text-right-nav-light dark:text-right-nav-dark px-4 py-2 rounded-2xl">Following</button>
                        <button className="bg-right-nav-dark dark:bg-right-nav-light text-right-nav-light dark:text-right-nav-dark px-4 py-2 rounded-2xl">Message</button>
                    </div>
                    :
                    <div>
                        <button className="bg-right-nav-dark dark:bg-right-nav-light text-right-nav-light dark:text-right-nav-dark px-4 py-2 rounded-2xl">Follow</button>
                    </div>
                }
            </div>
        </div>
    )
}