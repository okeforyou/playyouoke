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
        <div className="min-h-screen bg-whiten font-sans text-body flex selection:bg-primary selection:text-white">

            {/* 
              SIDEBAR (Desktop) 
              Style: White Clean (Nexus Ecommerce)
            */}
            <aside className="hidden lg:flex flex-col w-72 h-screen bg-white border-r border-stroke fixed top-0 left-0 z-50 transition-all duration-300">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 gap-3">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl">Y</div>
                    <div className="text-2xl font-bold tracking-tight text-boxdark">
                        YouOke <span className="text-body font-normal text-sm opacity-60">Admin</span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-8 px-6">
                    <p className="px-4 text-xs font-semibold text-bodydark2 uppercase tracking-wider mb-4">Menu</p>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = router.pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-2.5 px-4 py-3 rounded-sm transition-all duration-200 font-medium ${isActive
                                            ? 'bg-graydark text-white'
                                            : 'text-body hover:bg-adm-gray hover:text-boxdark'
                                            }`}
                                    >
                                        <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-stroke">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-sm hover:bg-danger/10 text-body hover:text-danger transition-all">
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
                <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-8 bg-white border-b border-stroke shadow-sm">
                    <div className="flex items-center gap-4 lg:hidden">
                        {/* Mobile Menu Trigger */}
                        <div className="dropdown">
                            <label tabIndex={0} className="btn btn-square btn-ghost btn-sm">
                                <Menu size={20} />
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-box w-52 text-body">
                                {menuItems.map((item) => (
                                    <li key={item.href}><Link href={item.href}>{item.name}</Link></li>
                                ))}
                                <div className="divider my-1"></div>
                                <li><button onClick={handleLogout} className="text-danger">Sign Out</button></li>
                            </ul>
                        </div>
                        <span className="font-bold text-lg text-boxdark">Admin</span>
                    </div>

                    {/* Header Right */}
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-boxdark">{user?.displayName || 'Administrator'}</span>
                            <span className="text-xs text-body">System Admin</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-adm-gray overflow-hidden border border-stroke p-1">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" />
                                ) : (
                                    <div className="text-body font-bold text-lg">{user?.email?.charAt(0).toUpperCase()}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 p-6 md:p-10 mx-auto w-full max-w-screen-2xl">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-title-md2 font-bold text-boxdark">
                            {headerTitle}
                        </h2>
                        <nav>
                            <ol className="flex items-center gap-2 text-sm text-body">
                                <li>Dashboard /</li>
                                <li className="text-primary font-medium">{headerTitle}</li>
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
