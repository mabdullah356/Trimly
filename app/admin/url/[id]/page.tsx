"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Link from 'next/link'
import {
    FiArrowLeft, FiLink, FiExternalLink, FiMousePointer, FiCalendar,
    FiGlobe, FiMonitor, FiCpu, FiShield, FiCheckCircle, FiXCircle,
    FiNavigation, FiLock, FiUnlock, FiSmartphone, FiActivity
} from 'react-icons/fi'

export default function UrlDetails({ params }: { params: any }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [urlData, setUrlData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const unwrappedParams: any = React.use(params);
    const id = unwrappedParams.id;

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && session?.user?.type !== "admin")) {
            router.push("/");
        }
    }, [session, status, router]);

    useEffect(() => {
        if (session?.user?.type === "admin" && id) {
            const fetchUrlDetails = async () => {
                try {
                    setLoading(true);
                    const { data } = await axios.get(`/api/admin/urls/${id}`);
                    setUrlData(data.url);
                } catch (error) {
                    console.error("Error fetching URL details:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUrlDetails();
        }
    }, [session, id]);

    if (status === "loading" || loading || !session || session.user.type !== "admin") {
        return <div className="flex h-screen items-center justify-center font-medium bg-white text-gray-400">Loading comprehensive analytics...</div>
    }

    if (!urlData) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4 bg-white">
                <p className="text-gray-500">URL details not found.</p>
                <Link href="/admin" className="text-emerald-600 font-bold hover:underline">Back to Dashboard</Link>
            </div>
        )
    }

    // Advanced Stats Calculation
    const uniqueClicks = new Set(urlData.clickHistory.map((c: any) => c.hashedIp)).size;
    const vpnCount = urlData.clickHistory.filter((c: any) => c.isVpn).length;
    const botCount = urlData.clickHistory.filter((c: any) => c.isBot).length;

    // Top Stats Helpers
    const getTop = (arr: any[], key: string) => {
        const counts = arr.reduce((acc: any, curr: any) => {
            const val = curr[key] || "Unknown";
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);
    };

    const topCountries = getTop(urlData.clickHistory, 'country');
    const topBrowsers = getTop(urlData.clickHistory, 'browser');

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
                        <FiArrowLeft /> Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Management Console</span>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">v1.2.0-PROD</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Analytics Container */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Hero Section */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-emerald-200 shadow-xl">
                                        <FiLink size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{urlData.shortUrl}</h1>
                                            {urlData.customAlias && (
                                                <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-black rounded uppercase tracking-widest">Alias</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                            {urlData.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 rounded-full leading-none">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></div> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-50 rounded-full leading-none">
                                                    <FiXCircle /> Paused
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold leading-none">
                                                <FiCalendar /> Indexed {new Date(urlData.createdAt).toLocaleDateString()}
                                            </div>
                                            {urlData.password ? (
                                                <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-black uppercase leading-none"><FiLock /> Protected</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-300 text-[10px] font-black uppercase leading-none"><FiUnlock /> Public</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Hits</p>
                                        <p className="text-4xl font-black text-gray-900 leading-none tracking-tighter">{urlData.clicks.toLocaleString()}</p>
                                    </div>
                                    <div className="h-full w-px bg-gray-100 mx-2"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Unique</p>
                                        <p className="text-4xl font-black text-emerald-600 leading-none tracking-tighter">{uniqueClicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FiGlobe className="text-emerald-500" /> Geography
                                </h4>
                                <div className="space-y-3">
                                    {topCountries.map(([country, count]: any) => (
                                        <div key={country} className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700">{country}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${(count / urlData.clicks) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-900">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FiMonitor className="text-blue-500" /> Top Browsers
                                </h4>
                                <div className="space-y-3">
                                    {topBrowsers.map(([browser, count]: any) => (
                                        <div key={browser} className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700">{browser}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${(count / urlData.clicks) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-900">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden relative">
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2 italic">
                                        Security Insights
                                    </h4>
                                    <div className="text-white space-y-1">
                                        <p className="text-2xl font-black">{vpnCount} Security Flags</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">VPN/Proxy connections detected</p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 text-emerald-500 opacity-20">
                                    <FiShield size={80} />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] italic">Granular Traffic Breakdown</h3>
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">Real-Time Sync</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-5">Connection Details</th>
                                            <th className="px-8 py-5">Platform Architecture</th>
                                            <th className="px-8 py-5">ISP / Provider</th>
                                            <th className="px-8 py-5 text-right">Verification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {urlData.clickHistory.length > 0 ? (
                                            urlData.clickHistory.slice().reverse().map((click: any) => (
                                                <tr key={click._id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-sm font-black text-gray-900 font-mono tracking-tight">{click.ip}</div>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                                                <FiGlobe className="text-emerald-500" /> {click.city || "--"}, {click.countryCode || "--"}
                                                                <span className="text-gray-200">|</span>
                                                                {click.timezone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-tighter">
                                                                {click.device === 'mobile' ? <FiSmartphone size={14} className="text-blue-500" /> : <FiMonitor size={14} className="text-emerald-500" />}
                                                                {click.browser} on {click.os}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-medium">Lang: {click.language || "un-dev"}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-xs font-bold text-gray-600 truncate max-w-[150px] italic">{click.isp || "Private Backbone"}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Type: {click.connectionType || 'Broadband'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="inline-flex flex-col items-end">
                                                            <div className="text-xs font-black text-gray-900 tabular-nums mb-1">
                                                                {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </div>
                                                            {click.isBot ? (
                                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 rounded-sm uppercase tracking-tighter">Bot Traffic</span>
                                                            ) : (
                                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-sm uppercase tracking-tighter">Verified Human</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-bold italic tracking-widest uppercase text-xs">Awaiting First Interaction...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta & Sidebar */}
                    <div className="space-y-8">

                        {/* Summary Action Card */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Destination Insight</h4>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Target Link</p>
                                    <a href={urlData.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 break-all hover:text-emerald-600 transition-colors flex items-start gap-2 group">
                                        <FiExternalLink className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                                        {urlData.originalUrl}
                                    </a>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1 leading-none">Status</p>
                                        <p className="text-xs font-black text-gray-900">{urlData.isActive ? 'OPERATIONAL' : 'PAUSED'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1 leading-none">Security</p>
                                        <p className="text-xs font-black text-gray-900 uppercase"> {urlData.password ? 'Locked' : 'Standard'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referral Stats */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                                Referral Traffic
                                <FiNavigation className="text-blue-500" />
                            </h4>
                            <div className="space-y-4">
                                {Object.entries(urlData.clickHistory.reduce((acc: any, c: any) => {
                                    const dom = c.refererDomain || "Direct / No Referrer";
                                    acc[dom] = (acc[dom] || 0) + 1;
                                    return acc;
                                }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4).map(([domain, count]: any) => (
                                    <div key={domain} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-gray-600 truncate max-w-[120px]">{domain}</span>
                                            <span className="text-gray-900">{((count / urlData.clicks) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400" style={{ width: `${(count / urlData.clicks) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Log Card */}
                        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Audited Traffic</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-lg"><FiActivity size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black leading-none">100% Reliable</p>
                                            <p className="text-[10px] opacity-60 font-bold uppercase mt-1 tracking-tighter">Real-time Data Integrity</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => window.print()} className="w-full mt-6 py-3 bg-white text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-900/20">
                                    Export Analysis
                                </button>
                            </div>
                            <FiActivity className="absolute -bottom-10 -right-10 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" size={180} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
