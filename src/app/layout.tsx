import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { type Metadata, type Viewport } from "next";
import { Geist, Geist_Mono, Montserrat, Inter, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL!
const appName = "LinkUp";
const appDescription = "LinkUp - Modern Social Connection Platform. Connect, discover, and communicate seamlessly with real-time notifications, instant link requests, and a beautiful user experience. Built with Next.js, Socket.IO, and MongoDB.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} - Modern Social Connection Platform`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "LinkUp",
    "social networking",
    "social platform",
    "connect people",
    "real-time chat",
    "social connections",
    "link requests",
    "social media",
    "networking platform",
    "real-time notifications",
    "Socket.IO",
    "Next.js social app",
    "modern social network",
    "connect with friends",
    "social discovery",
  ],
  authors: [{ name: "LinkUp Team" }],
  creator: "LinkUp",
  publisher: "LinkUp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: appName,
    title: `${appName} - Modern Social Connection Platform`,
    description: appDescription,
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${appName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Modern Social Connection Platform`,
    description: appDescription,
    images: [`${appUrl}/logo.png`],
    creator: "@linkup",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {

  },
  alternates: {
    canonical: appUrl,
  },
  category: "social networking",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${outfit.variable} ${inter.variable} ${dmSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-primary-light dark:bg-primary-dark h-full overflow-x-hidden`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-wrapper',
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #ffffff)',
              color: 'var(--toast-text, #3E434C)',
              border: 'var(--toast-border, 1px solid rgba(96, 100, 104, 0.2))',
              borderRadius: '0.75rem',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-text, #3E434C)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-text, #3E434C)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
          containerStyle={{
            top: 20,
            right: 20,
          }}
        />

        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
