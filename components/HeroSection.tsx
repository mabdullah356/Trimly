"use client";
import { FaLink, FaSpinner } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const HeroSection = () => {
  const { data: session } = useSession();
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleShorten = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const trimmedUrl = originalUrl.trim();
    try {
      const url = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      alert("Please enter a valid http or https URL");
      return;
    }
    if (!session) return router.push("/login");
    setLoading(true);
    try {
      const res = await axios.post("/api/url", { originalUrl: trimmedUrl });
      alert(res.data.message);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
      alert("Error shortening URL" + error.message);
    } finally {
      setLoading(false);
      setOriginalUrl("");
    }

  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <FaLink className="text-5xl text-emerald-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Shorten Your Links Instantly
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Trimly helps you create short, memorable links in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="url"
            required
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Please enter a valid URL")}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
            placeholder="Paste your URL here"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <button onClick={handleShorten} disabled={loading} className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600">
            {loading ? <FaSpinner className="animate-spin" /> : "Shorten"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
