"use client";

import { useRef, useEffect, useState } from "react";
import users from "@/constants/User";
import User from "@/components/search/User";
import Suggestions from "@/components/search/Suggestions";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery]);

    useEffect(() => {
        if(inputRef.current && inputRef.current.value ){
            setIsFocused(true);
        }
    }, [isFocused,inputRef.current?.value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsFocused(true);
  };

  return (
    <div className="w-full  mx-auto bg-left-nav-light dark:bg-right-nav-dark rounded-xl">
      {/* Sticky Search Input */}
      <div className="sticky top-0 z-10 bg-left-nav-light dark:bg-right-nav-dark border-b border-primary-light/30 dark:border-primary-dark/30 p-5 flex items-center rounded-t-xl">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          aria-label="Search users"
        />
      </div>

      {/* Suggestions when not focused */}
      {!isFocused && <Suggestions />}

      {/* Results/Filtered Users List */}
      {isFocused && (
        <div className="max-h-[80vh] overflow-y-auto hide-scrollbar p-4 space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <User
                key={user.username}
                username={user.username}
                name={user.name}
                isFollowing={user.isLinked}
                user_avatar={user.user_avatar}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 p-10 text-center text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
