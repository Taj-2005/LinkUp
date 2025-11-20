import NavbarLayoutWrapper from "@/components/NavbarLayoutWrapper";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import "@/app/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderWrapper>
        <NavbarLayoutWrapper>
        {children}
        </NavbarLayoutWrapper>
        <SpeedInsights />
    </ThemeProviderWrapper>
  );
}
