import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../features/auth/useAuthStore';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Menu,
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
    headerTitle?: string;
}

export default function AdminLayout({ children, headerTitle = "Admin Console" }: AdminLayoutProps) {
    const router = useRouter();
    const { user, signOut } = useAuthStore();

    const menuItems = [
        { name: 'Insights', icon: <LayoutDashboard size={20} />, href: '/admin' },
        { name: 'User Manager', icon: <Users size={20} />, href: '/admin/users' },
        { name: 'Plans & Config', icon: <CreditCard size={20} />, href: '/admin/plans' },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#1a222c] font-sans text-slate-600 dark:text-slate-300 flex selection:bg-indigo-500 selection:text-white transition-colors duration-300">

            {/* 
              SIDEBAR (Desktop) 
              Style: Dark matte (Nexus style)
            */}
            <aside className="hidden lg:flex flex-col w-72 h-screen bg-[#1C2434] text-white fixed top-0 left-0 z-50 transition-all duration-300">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-700/50">
                    <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">Y</div>
                    <div className="text-xl font-bold tracking-tight text-white">
                        YouOke <span className="text-gray-400 font-normal text-sm">Admin</span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = router.pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium ${isActive
                                                ? 'bg-[#333A48] text-white'
                                                : 'text-gray-400 hover:bg-[#333A48] hover:text-white'
                                            }`}
                                    >
                                        <span className={isActive ? 'text-indigo-400' : ''}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-700/50">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-all">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* 
              MAIN CONTENT
            */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">

                {/* Navbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white dark:bg-[#24303F] shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4 lg:hidden">
                        {/* Mobile Menu Trigger */}
                        <div className="dropdown">
                            <label tabIndex={0} className="btn btn-square btn-ghost btn-sm">
                                <Menu size={20} />
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white dark:bg-[#1C2434] rounded-box w-52 text-gray-500 dark:text-gray-300">
                                {menuItems.map((item) => (
                                    <li key={item.href}><Link href={item.href}>{item.name}</Link></li>
                                ))}
                                <div className="divider my-1"></div>
                                <li><button onClick={handleLogout} className="text-red-500">Sign Out</button></li>
                            </ul>
                        </div>
                        <span className="font-bold text-lg text-gray-700 dark:text-white">Admin</span>
                    </div>

                    {/* Header Right */}
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-700 dark:text-white">{user?.displayName || 'Administrator'}</span>
                            <span className="text-xs text-gray-500">System Admin</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{user?.email?.charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {headerTitle}
                        </h2>
                        <nav>
                            <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <li>Dashboard /</li>
                                <li className="text-indigo-500 font-medium">Overview</li>
                            </ol>
                        </nav>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
