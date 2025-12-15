import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { Menu, Search, ListMusic, Home, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../features/auth/useAuthStore';
import { SidebarPlayer } from '../features/player/components/SidebarPlayer';
import { PlayerControls } from '../features/player/components/PlayerControls';
import { QueueList } from '../features/player/components/QueueList';
import { MobileMiniPlayer } from '../features/player/components/MobileMiniPlayer';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isQueueOpen, setQueueOpen] = useState(false); // Mobile Queue Drawer
    const { user } = useAuthStore();

    return (
        <div className="flex h-screen w-full bg-base text-text-base overflow-hidden">

            {/* 
        -------------------------------------------
        LEFT COLUMN: Main Content (Search + Grid) 
        -------------------------------------------
      */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Mobile Header */}
                <header className="lg:hidden h-14 border-b border-border flex items-center px-4 justify-between bg-base/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">Y</div>
                        <h1 className="font-bold tracking-tight">YouOke</h1>
                    </div>
                    <button onClick={() => setQueueOpen(true)} className="p-2">
                        <ListMusic className="text-text-base" />
                    </button>
                </header>

                {/* Desktop Header (Integrated into Content Area) */}
                <header className="hidden lg:flex h-16 border-b border-border items-center px-6 justify-between bg-base shrink-0">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">Y</div>
                            <h1 className="text-xl font-bold tracking-tight">YouOke</h1>
                        </div>
                        <nav className="flex items-center gap-6 text-sm font-medium">
                            <Link href="/" className="hover:text-primary transition-colors">Find Songs</Link>
                            <Link href="/monitor" className="hover:text-primary transition-colors">Monitor</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium">{user.displayName || "User"}</p>
                                    <p className="text-xs text-text-muted">Pro Member</p>
                                </div>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border border-border" />
                                ) : (
                                    <div className="w-9 h-9 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-600 transition text-sm font-medium shadow-sm">
                                Login
                            </Link>
                        )}
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {children}
                </main>

                {/* Mobile Mini Player */}
                <MobileMiniPlayer onExpandQueue={() => setQueueOpen(true)} />
            </div>

            {/* 
        -------------------------------------------
        RIGHT COLUMN: Fixed Sidebar (Player + Queue) 
        Desktop Only
        -------------------------------------------
      */}
            <aside className="hidden lg:flex w-[400px] bg-muted border-l border-border flex-col shadow-xl z-20 overflow-hidden">
                {/* Player Area */}
                <div className="aspect-video bg-black sticky top-0 shrink-0 shadow-lg z-30">
                    <SidebarPlayer />
                </div>

                {/* Controls */}
                <PlayerControls />

                {/* Queue List */}
                <QueueList />
            </aside>

            {/* 
        -------------------------------------------
        MOBILE DRAWER: Queue
        -------------------------------------------
      */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
                    isQueueOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setQueueOpen(false)}
            />
            <div
                className={clsx(
                    "fixed inset-x-0 bottom-0 z-50 bg-base rounded-t-2xl shadow-2xl transition-transform duration-300 lg:hidden flex flex-col max-h-[85vh]",
                    isQueueOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="font-bold">Current Queue</span>
                    <button onClick={() => setQueueOpen(false)}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 text-center text-text-muted">
                    Queue is empty
                </div>
            </div>

        </div>
    );
}
