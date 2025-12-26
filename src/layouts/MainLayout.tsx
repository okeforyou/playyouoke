import React, { ReactNode, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Menu, Search, ListMusic, Home, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../features/auth/useAuthStore';
import { SidebarPlayer } from '../features/player/components/SidebarPlayer';
import { PlayerControls } from '../features/player/components/PlayerControls';
import { QueueList } from '../features/player/components/QueueList';
import { MobileMiniPlayer } from '../features/player/components/MobileMiniPlayer';
import { CastButton } from '../components/CastButton';
import { useSystemConfig } from '../hooks/useSystemConfig';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const router = useRouter();
    const [isQueueOpen, setQueueOpen] = useState(false); // Mobile Queue Drawer
    const [isMobilePlayerExpanded, setMobilePlayerExpanded] = useState(false); // Mobile Global Player Expansion

    // Auth & Config
    const { user } = useAuthStore();
    const { config } = useSystemConfig();

    // Permission Check
    const userRole = (user?.role === 'admin' || user?.role === 'premium') ? 'premium' : 'free';
    const allowRemote = config?.membership[userRole]?.allow_remote ?? true;

    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize Cast Service (Create Room)
        const initCast = async () => {
            const { castService } = await import('../features/cast/services/CastService');
            const code = await castService.initialize();
            setRoomCode(code);
        };
        initCast();

        return () => {
            // Cleanup handled by service/window unload usually, 
            // but we can be explicit if needed.
            // castService.cleanup();
        };
    }, []);

    // Prevent hydration mismatch by not rendering auth-dependent UI on server
    // Or we can just let the structural shell render and only hide the user/button part.
    // But for simplicity, let's keep it safe. 
    // Actually, returning null for the whole layout might cause flash.
    // Better to just use 'mounted' flag in the JSX for specific parts.

    return (
        <div className="flex h-screen w-full bg-base text-text-base overflow-hidden">

            {/* 
                -------------------------------------------
                LEFT SIDEBAR: Navigation (Desktop)
                -------------------------------------------
            */}
            <aside className="hidden lg:flex w-64 bg-base border-r border-border flex-col shrink-0 z-30">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">Y</div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-none">YouOke</h1>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wide">Karaoke Online</p>
                        </div>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">เมนูหลัก</div>

                    <Link href="/" className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium",
                        router.pathname === '/' ? "bg-primary text-white shadow-md shadow-primary/30" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    )}>
                        <Home className="w-5 h-5" />
                        <span>หน้าหลัก</span>
                    </Link>

                    <Link href="/monitor" className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium",
                        router.pathname === '/monitor' ? "bg-primary text-white shadow-md shadow-primary/30" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    )}>
                        <span className="text-lg">📺</span>
                        <span>จอภาพ (Monitor)</span>
                    </Link>

                    <div className="mt-6 px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">ช่วยเหลือ</div>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition-all font-medium">
                        <span className="text-lg">💬</span>
                        <span>ติดต่อ LINE</span>
                    </a>

                    {(user?.role === 'admin' || user?.email?.includes('admin')) && (
                        <div className="mt-4">
                            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                            <Link href="/admin" className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-bold",
                                router.pathname.startsWith('/admin') ? "text-red-600 bg-red-50" : "text-red-500 hover:bg-red-50"
                            )}>
                                <span>🛡️</span>
                                <span>ระบบจัดการ</span>
                            </Link>
                        </div>
                    )}
                </nav>

                {/* User / Login Section (Bottom of Sidebar) */}
                <div className="p-4 border-t border-border bg-base-100/50">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">บัญชี</div>
                    {mounted && (
                        user ? (
                            <div className="flex items-center gap-3 px-2 py-2">
                                {user.photoURL ? (
                                    <img src={user.photoURL} className="w-9 h-9 rounded-full border border-gray-200" alt="" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold truncate">{user.displayName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">Pro Member</p>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium">
                                <span className="text-lg">🔐</span>
                                <span>เข้าสู่ระบบ</span>
                            </Link>
                        )
                    )}
                </div>
            </aside>

            {/* 
        -------------------------------------------
        CENTER COLUMN: Main Content
        -------------------------------------------
      */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Mobile Header (Hamburger) */}
                <header className="lg:hidden h-14 border-b border-border flex items-center px-4 justify-between bg-base/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">Y</div>
                        <h1 className="font-bold tracking-tight">YouOke</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <CastButton />
                        <button onClick={() => setQueueOpen(true)} className="p-2">
                            <ListMusic className="text-text-base" />
                        </button>
                    </div>
                </header>

                {/* Desktop Header (Top Right Controls) */}
                <header className="hidden lg:flex h-16 border-b border-border items-center px-6 justify-between bg-base shrink-0">
                    {/* Empty Left Placeholder */}
                    <div className="flex-1"></div>

                    <div className="flex items-center gap-4">
                        {/* Cast Button */}
                        <div className="relative">
                            <CastButton />
                        </div>

                        {/* Remote / QR Button */}
                        {allowRemote && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowQRCode(!showQRCode)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showQRCode
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg">📱</span>
                                    <span className="text-sm font-medium">Remote</span>
                                </button>

                                {/* QR Popup */}
                                {showQRCode && roomCode && (
                                    <div className="absolute top-12 right-0 p-4 bg-white shadow-xl rounded-xl border border-gray-200 z-50 w-64 text-center animate-in fade-in zoom-in-95 duration-200 scale-100 origin-top-right">
                                        <h3 className="font-bold text-gray-900 mb-2">Scan to Control</h3>
                                        <div className="bg-white p-2 rounded-lg border border-gray-100 inline-block mb-2 shadow-inner">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                                    `${typeof window !== 'undefined' ? window.location.origin : ''}/remote?room=${roomCode}`
                                                )}`}
                                                alt="QR Code"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Scan with your phone to add songs</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Scrolling Page Content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {children}
                </main>

                {/* Mobile Mini Player */}
                <MobileMiniPlayer
                    onExpandQueue={() => setQueueOpen(true)}
                    onExpandPlayer={() => setMobilePlayerExpanded(true)}
                />
            </div>

            {/* 
                -------------------------------------------
                GLOBAL PLAYER CONTAINER (Always Mounted)
                -------------------------------------------
            */}
            {mounted && (
                <div className={clsx(
                    "fixed transition-all duration-500 z-[100] bg-black overflow-hidden shadow-2xl",
                    "lg:top-0 lg:right-0 lg:w-[400px] lg:h-[225px] lg:translate-y-0 lg:opacity-100",
                    !isMobilePlayerExpanded ? "max-lg:opacity-0 max-lg:pointer-events-none max-lg:fixed max-lg:bottom-0 max-lg:right-0 max-lg:w-1 max-lg:h-1" :
                        "max-lg:inset-0 max-lg:w-full max-lg:h-full max-lg:opacity-100"
                )}>
                    <div className="relative w-full h-full">
                        <SidebarPlayer />
                        <button
                            onClick={() => setMobilePlayerExpanded(false)}
                            className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full lg:hidden"
                        >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* 
        -------------------------------------------
        RIGHT COLUMN: Queue Sidebar
        -------------------------------------------
      */}
            <aside className="hidden lg:flex w-[400px] bg-white border-l border-border flex-col shadow-xl z-20 overflow-hidden">
                {mounted ? (
                    <>
                        {/* Player Placeholder */}
                        <div className="aspect-video bg-black/10 shrink-0"></div>

                        {/* Controls */}
                        <PlayerControls />

                        {/* Queue List */}
                        <QueueList />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                )}
            </aside>

            {/* Mobile Drawer (Queue) */}
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
                    <button onClick={() => setQueueOpen(false)}><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto bg-muted">
                    <QueueList />
                </div>
            </div>

        </div>
    );
}
