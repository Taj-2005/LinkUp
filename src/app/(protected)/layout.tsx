import NavbarLayoutWrapper from "@/components/NavbarLayoutWrapper";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderWrapper>
        <Toaster position="top-right" />
        <NavbarLayoutWrapper>
        {children}
        </NavbarLayoutWrapper>
        <SpeedInsights />
    </ThemeProviderWrapper>
  );
}
