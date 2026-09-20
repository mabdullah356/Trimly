"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { FiLink, FiExternalLink, FiUser, FiMousePointer, FiCalendar, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'
export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [urls, setUrls] = useState([]);
    const [stats, setStats] = useState({ total: 0, clicks: 0 });

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && session?.user?.type !== "admin")) router.push("/");
    }, [session, status, router]);

    useEffect(() => {
        if (session?.user?.type === "admin") {
            const fetchUrls = async () => {
                const { data } = await axios.get('/api/admin/urls');
                setUrls(data.urls);
                setStats({ total: data.totalUrls, clicks: data.urls.reduce((acc: number, curr: any) => acc + curr.clicks, 0) });
            };
            fetchUrls();
        }
    }, [session]);

    if (status === "loading" || !session || session.user.type !== "admin") return <div className="flex h-screen items-center justify-center font-medium">Verifying Admins Session...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl py-10">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                        <p className="text-gray-500 text-sm">Monitor and manage all shortened URLs across the platform</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><FiTrendingUp size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Total Clicks</p>
                                <p className="text-xl font-bold text-gray-900">{stats.clicks.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FiLink size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Total URLs</p>
                                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Short URL</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Original Destination</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Created By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Clicks</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {urls.map((url: any) => (
                                    <tr key={url._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-emerald-600 font-mono text-sm font-semibold hover:underline">
                                            <Link href={`/admin/url/${url._id}`} className="flex items-center gap-2">
                                                <FiLink size={14} />
                                                <span>{url.shortUrl}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm truncate">
                                                <FiExternalLink size={14} className="shrink-0" />
                                                <span className="truncate">{url.originalUrl}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                                                <FiUser size={14} className="text-gray-400" />
                                                <span>{url.userId?.fullName || "Guest"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold text-gray-700">
                                                <FiMousePointer size={12} />
                                                {url.clicks}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {url.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase"><FiCheckCircle /> Active</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-500 text-xs font-bold uppercase"><FiXCircle /> Paused</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <FiCalendar size={14} />
                                                <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}