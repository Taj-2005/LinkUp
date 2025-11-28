"use client";

import { createContext, useContext, ReactNode } from "react";

interface NavbarContextType {
  setSelectedItem: (item: string) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children, setSelectedItem }: { children: ReactNode; setSelectedItem: (item: string) => void }) {
  return (
    <NavbarContext.Provider value={{ setSelectedItem }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
}

