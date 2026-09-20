import { DbConnect } from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import ShortUrl from "@/Models/shortUrl.model";
import { getServerSession } from "next-auth";
import nextAuthOptions from "@/config/nextAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(nextAuthOptions);
        if (!session || session.user.type !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await DbConnect();
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "URL ID is required" }, { status: 400 });
        }
        const url = await ShortUrl.findById(id);
        if (!url) {
            return NextResponse.json({ message: "URL not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "URL fetched successfully", url });
    } catch (error) {
        console.error("Error getting URL:", error);
        return NextResponse.json({ message: "Failed to get URL" }, { status: 500 });
    }
}