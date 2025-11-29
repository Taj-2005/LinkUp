import NavbarLayoutWrapper from "@/components/NavbarLayoutWrapper";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import LinkRequestToastContainer from "@/components/LinkRequestToastContainer";
import SocketInitializer from "@/components/SocketInitializer";
import "@/app/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderWrapper>
        <SocketInitializer>
        <NavbarLayoutWrapper>
        {children}
        </NavbarLayoutWrapper>
          <LinkRequestToastContainer />
        </SocketInitializer>
        <SpeedInsights />
    </ThemeProviderWrapper>
  );
}
