"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Reports", href: "/reports", icon: FileText },
        { name: "Accounts", href: "/accounts", icon: CreditCard },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-72 bg-emerald-950 text-white shadow-2xl transform -translate-x-full md:translate-x-0 transition-transform duration-300 z-50 flex flex-col">
            {/* Logo Section */}
            <div className="h-24 flex items-center px-8 border-b border-emerald-900/50">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">Finly</span>
                        <span className="text-xs text-emerald-500 font-medium tracking-wider uppercase">Finance AI</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider px-4 mb-4">Main Menu</div>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 overflow-hidden",
                                isActive
                                    ? "bg-emerald-600/10 text-emerald-400"
                                    : "text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white"
                            )}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-emerald-500 rounded-r-full" />
                            )}

                            <Icon className={cn(
                                "w-5 h-5 mr-3 transition-transform duration-300",
                                isActive ? "scale-110 text-emerald-400" : "group-hover:scale-110"
                            )} />

                            <span className="font-medium relative z-10">{link.name}</span>

                            {/* Hover Chevron */}
                            <ChevronRight className={cn(
                                "w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all duration-300",
                                "group-hover:opacity-100 group-hover:translate-x-0",
                                isActive && "opacity-100 translate-x-0 text-emerald-500"
                            )} />
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-emerald-900/50 bg-emerald-950/50">
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-emerald-900/50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md group-hover:ring-2 ring-emerald-500/50 transition-all">
                        SJ
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Simon Jimmy</p>
                        <p className="text-xs text-emerald-400 truncate">Pro Plan</p>
                    </div>
                    <LogOut className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </aside>
    );
}
