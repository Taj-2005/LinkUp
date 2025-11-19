"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsPage() {
  return (
    <div className="w-full flex flex-row bg-primary-light dark:bg-primary-dark h-screen">
      <div className="w-full m-2 h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">

        <div className="w-[70%] max-w-4xl h-full bg-left-nav-light dark:bg-right-nav-dark p-6 overflow-y-auto hide-scrollbar">
          <SettingsPanel />
        </div>

        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30 flex flex-col">

          <div className="flex justify-end m-2">
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
