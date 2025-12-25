import Head from "next/head";
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useSystemConfig } from "../../hooks/useSystemConfig";
import { Users, Music, Activity, DollarSign } from "lucide-react";

export default function AdminDashboard() {
    const { config } = useSystemConfig();
    // Mock Data for now
    const stats = [
        { title: "Active Users", value: "124", icon: <Users className="text-primary" />, desc: "+12% this week" },
        { title: "Songs Played", value: "8,432", icon: <Music className="text-secondary" />, desc: "All time" },
        { title: "Server Load", value: "34%", icon: <Activity className="text-accent" />, desc: "Healthy" },
        { title: "Est. Revenue", value: "฿0.00", icon: <DollarSign className="text-success" />, desc: "Free Mode" },
    ];

    return (
        <AdminLayout headerTitle="System Insight">
            <Head>
                <title>Dashboard - YouOke Admin</title>
            </Head>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="card bg-base-100 shadow-xl border border-base-200 hover:border-primary/50 transition-all duration-300">
                        <div className="card-body p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">{stat.title}</p>
                                    <h3 className="text-3xl font-black mt-2">{stat.value}</h3>
                                </div>
                                <div className="p-3 bg-base-200 rounded-xl">
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-xs text-base-content/60 mt-4 flex items-center gap-1">
                                {stat.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-lg mb-4">Recent Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-sm">
                                        <td className="font-mono opacity-50">10:42 AM</td>
                                        <td>Guest_99</td>
                                        <td><span className="badge badge-sm badge-success">Join</span></td>
                                        <td>Joined Room #AB12</td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td className="font-mono opacity-50">10:40 AM</td>
                                        <td>Admin</td>
                                        <td><span className="badge badge-sm badge-warning">Config</span></td>
                                        <td>Updated Free Limits</td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td className="font-mono opacity-50">10:35 AM</td>
                                        <td>System</td>
                                        <td><span className="badge badge-sm badge-info">Start</span></td>
                                        <td>Server Online</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-lg mb-4">Current Config</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                <span className="text-sm">Maintenance Mode</span>
                                <span className="badge badge-ghost">OFF</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                <span className="text-sm">Free User Limit</span>
                                <span className="font-mono font-bold text-primary">{config?.membership.free.max_daily_songs || 'Unl'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                <span className="text-sm">Allow Remote</span>
                                <span className={`badge ${config?.membership.free.allow_remote ? 'badge-success' : 'badge-error'}`}>
                                    {config?.membership.free.allow_remote ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        <div className="divider"></div>
                        <button className="btn btn-outline btn-sm w-full">View System Logs</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
