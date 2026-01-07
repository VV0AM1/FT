import "./globals.css";
import Providers from "./providers";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Root layout wraps app with Providers (Session, Query)
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-foreground)]">
        <Providers>
          {children}
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}