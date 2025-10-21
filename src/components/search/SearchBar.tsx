"use client";

import { useRef, useEffect, useState } from "react";
import users from "@/constants/User";
import User from "@/components/search/User";
import Suggestions from "@/components/search/Suggestions";

interface SearchBarProps {
    isFocused: boolean;
    setIsFocused: (focused: boolean) => void;
}

export default function SearchBar(){
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(users);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    useEffect(() => {
        if (searchQuery.trim() !== "") {
            const filtered = users.filter(user => 
                user.username.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                user.name.toLowerCase().startsWith(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery]);
    
    useEffect(() => {
        if(inputRef.current && inputRef.current.value ){
            setIsFocused(true);
        }
    }, [isFocused,inputRef.current?.value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value) {
            setIsFocused(true);
        }
    };
    
    return (
        <div>
            <div className="w-full p-10 border-b-[0.1] border-gray-500">
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                />
            </div>
            
            {!isFocused && <Suggestions/>}
            
            {isFocused && (
                <div className="overflow-y-auto max-h-[600px] hide-scrollbar">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <User 
                                key={user.username} 
                                username={user.username} 
                                name={user.name} 
                                isFollowing={user.isFollowing}
                            />
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}