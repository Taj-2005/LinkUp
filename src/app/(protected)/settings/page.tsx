"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsPage() {
  return (
    <div className="w-full flex flex-row bg-primary-light dark:bg-primary-dark h-screen">
      <div className="w-full m-2 md:m-2 h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">

        <div className="w-full md:w-[70%] md:max-w-4xl h-full bg-left-nav-light dark:bg-right-nav-dark p-4 md:p-6 overflow-y-auto hide-scrollbar">
          <SettingsPanel />
        </div>

        <div className="w-full md:w-[30%] border-t md:border-t-0 md:border-l border-primary-light/30 dark:border-primary-dark/30 flex flex-col mt-4 md:mt-0">

          <div className="flex justify-end m-2 md:m-2">
            <ToggleSwitch />
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <SettingsSidebar />
          </div>
        </div>

      </div>
    </div>
  );
}
