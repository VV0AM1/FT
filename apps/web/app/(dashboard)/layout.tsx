import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            {/* Sidebar - Desktop */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur md:hidden">
                    <span className="font-bold text-lg text-[var(--color-primary)]">Finly</span>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
