import Head from "next/head";
import AdminLayout from "../../layouts/AdminLayout";
import { Search, MoreVertical, Shield, UserCheck, UserX } from "lucide-react";

export default function AdminUsersPage() {
    // Mock Data
    const users = [
        { id: 1, name: "Admin User", email: "admin@youoke.com", role: "admin", status: "active", plan: "VVIP" },
        { id: 2, name: "John Doe", email: "john@gmail.com", role: "user", status: "active", plan: "Free" },
        { id: 3, name: "Jane Smith", email: "jane@yahoo.com", role: "user", status: "offline", plan: "Free" },
        { id: 4, name: "Bar Owner", email: "boss@bar.com", role: "admin", status: "active", plan: "Pro" },
        { id: 5, name: "Guest_123", email: "no-email", role: "guest", status: "active", plan: "Free" },
    ];

    return (
        <AdminLayout headerTitle="User Management">
            <Head>
                <title>Users - YouOke Admin</title>
            </Head>

            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-0">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-base-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="join w-full md:w-auto">
                            <div className="join-item flex items-center bg-base-200 px-3">
                                <Search size={18} className="opacity-50" />
                            </div>
                            <input className="input input-bordered join-item w-full md:w-64" placeholder="Search users..." />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-outline btn-sm">Filter</button>
                            <button className="btn btn-primary btn-sm">+ Add User</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                        <span>{u.name.charAt(0)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{u.name}</div>
                                                    <div className="text-sm opacity-50">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {u.role === 'admin' ? (
                                                <div className="badge badge-primary gap-1"><Shield size={10} /> Admin</div>
                                            ) : (
                                                <div className="badge badge-ghost">User</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="font-mono font-bold text-xs">{u.plan}</div>
                                        </td>
                                        <td>
                                            {u.status === 'active' ? (
                                                <div className="flex items-center gap-2 text-success text-xs font-bold uppercase">
                                                    <span className="w-2 h-2 rounded-full bg-success"></span> Online
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-base-content/30 text-xs font-bold uppercase">
                                                    <span className="w-2 h-2 rounded-full bg-base-300"></span> Offline
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-square btn-sm">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-base-200 flex justify-center">
                        <div className="join">
                            <button className="join-item btn btn-sm">1</button>
                            <button className="join-item btn btn-sm btn-active">2</button>
                            <button className="join-item btn btn-sm">3</button>
                            <button className="join-item btn btn-sm">4</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
