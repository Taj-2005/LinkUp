"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ToggleSwitch() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex justify-end items-end w-full p-4">
            <button
                aria-label="Toggle Dark Mode"
                type="button"
                className="text-black dark:text-white hover:opacity-75 transition-opacity flex justify-end items-end"
                onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
            >
                {resolvedTheme === "dark" ? <FiSun size={30}/> : <FiMoon size={30}/>}
            </button>
        </div>
    )
}
