import { DbConnect } from "@/config/mongodb";
import ShortUrl from "@/Models/shortUrl.model";
import { NextResponse, NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import authOptions from "@/config/nextAuth";

export async function POST(request: NextRequest) {
    await DbConnect();
    const { originalUrl } = await request.json();
    const trimmedUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

    if (!trimmedUrl) {
        return NextResponse.json({ message: "Original URL is required" }, { status: 400 });
    }

    try {
        const url = new URL(trimmedUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
        return NextResponse.json({ message: "A valid http or https URL is required" }, { status: 400 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        };

        const newShortUrl = new ShortUrl({
            userId: session.user.id,
            originalUrl: trimmedUrl,
            shortUrl: nanoid(8),
        });
        await newShortUrl.save();
        return NextResponse.json({ message: "Short URL created successfully", url: newShortUrl }, { status: 200 });

    } catch (error) {
        console.error("Error creating short URL:", error);
        return NextResponse.json({ message: "Error creating short URL" }, { status: 500 });
    }

};


export async function GET() {

    try {
        await DbConnect();

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        };

        const shortUrls = await ShortUrl.find({ userId: session.user.id }).sort({ createdAt: -1 }).select("originalUrl shortUrl clicks");

        return NextResponse.json({
            message: "ShortUrl fetched successfully",
            totalUrls: shortUrls.length,
            urls: shortUrls
        }, { status: 200 });

    } catch (error) {

        console.error("Error fetching short URLs:", error);
        return NextResponse.json({ message: "Error fetching short URLs" }, { status: 500 });

    }
}