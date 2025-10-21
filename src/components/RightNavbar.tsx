"use client";

import Home from "@/components/Home";
import Search from "@/components/Search";
import Messages from "@/components/Messages";
import Notifications from "@/components/Notifications";
import Create from "@/components/Create";
import Profile from "@/components/Profile";

interface RightNavbarProps {
    selectedItem: string;
}

export default function RightNavbar({selectedItem} : RightNavbarProps){
    if (selectedItem === "Home"){
        return <Home />;
    }else if (selectedItem === "Search"){
        return <Search />;
    }else if (selectedItem === "Messages"){
        return <Messages />;
    }else if (selectedItem === "Notifications"){
        return <Notifications />;
    }else if (selectedItem === "Create"){
        return <Create />; 
    }else if (selectedItem === "Profile"){
        return <Profile />;
    }
}