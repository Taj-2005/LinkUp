"use client";

import { useState, useEffect } from "react";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { ArrowLeft } from "lucide-react";
import { useNavbarStore } from "@/store/useNavbarStore";

export default function SettingsPage() {
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const setSelectedItem = useNavbarStore((state) => state.setSelectedItem);

  const showSidebar = selectedSetting === null;

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSelectedItem("linkhub");
    }
  }, [setSelectedItem]);

  return (
    <div className="w-full flex flex-row bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">

        <div className={`w-full md:w-[70%] md:max-w-4xl h-full md:h-full bg-left-nav-light dark:bg-right-nav-dark p-2 md:p-6 overflow-y-auto hide-scrollbar ${showSidebar ? 'hidden md:block' : 'block'}`}>
          {selectedSetting && (
            <button
              onClick={() => setSelectedSetting(null)}
              className="md:hidden mb-2 p-2 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 rounded-lg transition-colors flex-shrink-0 sticky top-0 z-10 bg-left-nav-light dark:bg-right-nav-dark"
              aria-label="Back to settings"
            >
              <ArrowLeft className="w-5 h-5 text-primary-dark dark:text-primary-light" />
            </button>
          )}
          <div className="min-h-full flex flex-col">
            <SettingsPanel />
          </div>
        </div>

        <div className={`w-full md:w-[30%] border-t md:border-t-0 md:border-l border-primary-light/30 dark:border-primary-dark/30 flex flex-col h-full md:h-full ${showSidebar ? 'flex' : 'hidden md:flex'}`}>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden hide-scrollbar pb-20 md:pb-0">
            <SettingsSidebar onItemClick={setSelectedSetting} />
          </div>
        </div>

      </div>
    </div>
  );
}
