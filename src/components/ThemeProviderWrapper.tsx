"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export default function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark" 
      enableSystem={false} 
      disableTransitionOnChange={false}
    >
      <div className="bg-primary-light dark:bg-primary-dark h-full min-h-screen flex flex-col">
        {children}
      </div>
    </ThemeProvider>
  );
}
