import "./globals.css";
import Link from "next/link";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <header className="sticky top-0 border-b bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-4xl p-3 flex items-center gap-3">
            <select className="border rounded-lg px-2 py-1">
              <option>Sep 2025</option>
            </select>
            <select className="ml-auto border rounded-lg px-2 py-1">
              <option>All Accounts</option>
            </select>
          </div>
        </header>

        <main className="mx-auto max-w-4xl w-full p-4">
          <Providers>{children}</Providers>
        </main>

        <nav className="md:hidden sticky bottom-0 border-t bg-white">
          <div className="grid grid-cols-3 text-center">
            <Link className="p-3" href="/">Dashboard</Link>
            <Link className="p-3" href="/transactions">Transactions</Link>
            <Link className="p-3" href="/rules">Rules</Link>
          </div>
        </nav>
      </body>
    </html>
  );
}