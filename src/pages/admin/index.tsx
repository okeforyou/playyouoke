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
        <AdminLayout headerTitle="YouOke Command Center (v2)">
            <Head>
                <title>Dashboard - YouOke Admin</title>
            </Head>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark transition-all hover:shadow-md">
                        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 mb-4">
                            <div className="text-primary dark:text-white p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                                {stat.icon}
                            </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <h4 className="text-title-md font-bold text-black dark:text-white text-2xl">
                                    {stat.value}
                                </h4>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</span>
                            </div>

                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {stat.desc}
                            </span>
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
