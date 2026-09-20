"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios';

interface UrlsProps {
    _id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
}


const Urls = () => {
    const [urls, setUrls] = useState<UrlsProps[]>([]);
    const appBaseUrl = process.env.APP_URL || "https://trimly-pro.vercel.app/";

    useEffect(() => {
        const fetchUrls = async () => {
            const res = await axios.get('/api/url');
            setUrls(res.data.urls.sort((a: UrlsProps, b: UrlsProps) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        };
        const handleUrlCreated = () => {
            fetchUrls();
        };

        fetchUrls();
        window.addEventListener('url-created', handleUrlCreated);

        return () => {
            window.removeEventListener('url-created', handleUrlCreated);
        };
    }, []);

    const deleteUrl = async (id: string) => {
        await axios.delete(`/api/url/${id}`);
        const res = await axios.get('/api/url');
        setUrls(res.data.urls);
    };

    return (
        <main className="flex-1">
            <section className="container mx-auto px-4">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Your URLs</h1>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold">Total URLs: {urls?.length ? urls.length : 0}</h2>
                    </div>
                    <section className="grid py-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {urls.map((url) => (
                            <div key={url.shortUrl} className="flex flex-col gap-4 border border-gray-300 rounded-lg p-4 w-full overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                                    <label className="text-sm sm:text-lg font-bold whitespace-nowrap">Original URL</label>
                                    <h2 className="text-xs font-mono truncate min-w-0 w-full">{url.originalUrl}</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                                    <label className="text-sm sm:text-lg font-bold whitespace-nowrap">Short URL</label>
                                    <h2 className="text-xs font-mono truncate min-w-0 w-full">{appBaseUrl}/{url.shortUrl}</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                                    <label className="text-sm sm:text-lg font-bold whitespace-nowrap">Clicks</label>
                                    <h2 className="text-sm sm:text-lg min-w-0">{url.clicks}</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                                    <button onClick={() => copyToClipboard(url.shortUrl)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors duration-200">Copy</button>
                                    <button onClick={() => deleteUrl(url._id)} className="flex-1 px-4 py-2 rounded-lg cursor-pointer bg-red-500 hover:bg-red-700 text-white transition-colors duration-200">Delete</button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </section>
        </main>
    )
}

export default Urls

function copyToClipboard(text: string) {
    const appBaseUrl = process.env.APP_URL || "https://trimly-pro.vercel.app/";
    navigator.clipboard.writeText(appBaseUrl + "/" + text);
}