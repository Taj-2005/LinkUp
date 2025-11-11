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
    if (selectedItem === "livelinks"){
        return <Home />;
    }else if (selectedItem === "linkfinder"){
        return <Search />;
    }else if (selectedItem === "linkups"){
        return <Messages />;
    }else if (selectedItem === "linkupreqs"){
        return <Notifications />;
    }else if (selectedItem === "newlink"){
        return <Create />; 
    }else if (selectedItem === "linkhub"){
        return <Profile />;
    }
}