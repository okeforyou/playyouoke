import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../features/auth/useAuthStore';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    Music,
    ShieldAlert
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
        // Future expansion
        // { name: 'Shop Mode', icon: <Music size={20} />, href: '/admin/shop' },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-base-300 font-sans text-base-content selection:bg-primary selection:text-white flex">

            {/* 
        SIDEBAR (Desktop) 
        Fixed position, always visible on LG screens
      */}
            <aside className="hidden lg:flex flex-col w-72 h-screen px-4 py-8 overflow-y-auto bg-base-100 border-r border-base-200 fixed top-0 left-0 z-50">
                {/* Logo Area */}
                <div className="mb-8 px-2">
                    <div className="text-3xl font-black tracking-tighter flex items-center gap-2">
                        <span className="text-primary">You</span>Oke
                        <span className="badge badge-accent badge-sm align-top">PRO</span>
                    </div>
                    <p className="text-xs text-base-content/50 mt-1 uppercase tracking-widest pl-1">Command Center</p>
                </div>

                {/* Menu Items */}
                <ul className="space-y-2 flex-1">
                    {menuItems.map((item) => {
                        const isActive = router.pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-primary text-primary-content shadow-lg shadow-primary/30 font-bold'
                                            : 'hover:bg-base-200 hover:pl-6'
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Footer Actions */}
                <div className="mt-auto border-t border-base-200 pt-4 space-y-2">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-error hover:text-error-content transition-all text-error">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                    <div className="text-xs text-center pt-4 text-base-content/30">
                        v0.2.1 • Build 2024
                    </div>
                </div>
            </aside>

            {/* 
        MAIN CONTENT
        Pushed right by 18rem (w-72) on Desktop
      */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">

                {/* Navbar (Mobile + Header) */}
                <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-200 sticky top-0 z-30 px-4 md:px-8">
                    <div className="flex-none lg:hidden">
                        {/* Mobile Drawer Trigger (We use a simple dropdown or separate drawer for mobile later) 
                 For now, let's keep it simple: Mobile Menu via Dropdown or just hidden sidebar
             */}
                        <div className="dropdown">
                            <label tabIndex={0} className="btn btn-square btn-ghost">
                                <Menu size={24} />
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                {menuItems.map((item) => (
                                    <li key={item.href}><Link href={item.href}>{item.name}</Link></li>
                                ))}
                                <div className="divider my-1"></div>
                                <li><button onClick={handleLogout} className="text-error">Sign Out</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex-1 px-2">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            {headerTitle}
                        </h1>
                    </div>

                    <div className="flex-none gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold">{user?.displayName || 'Admin'}</span>
                            <span className="text-xs text-base-content/60 badge badge-xs badge-primary">System Admin</span>
                        </div>
                        <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10 ring ring-primary ring-offset-base-100 ring-offset-2">
                                <span className="text-xs">{user?.email?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Viewport */}
                <main className="flex-1 p-6 md:p-10 relative">
                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
                        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary rounded-full blur-[128px]"></div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
