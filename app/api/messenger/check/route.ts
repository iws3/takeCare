import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "messages.json");

export async function GET(req: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lastSeen = searchParams.get("lastSeen");

    if (!fs.existsSync(MESSAGES_FILE)) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const history = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    
    // Filter by User ID AND Time
    let newMessages = history.filter((m: any) => m.userId === session?.user?.id);
    
    if (lastSeen) {
      newMessages = newMessages.filter((m: any) => new Date(m.receivedAt) > new Date(lastSeen));
    }

    return NextResponse.json({ 
      success: true, 
      messages: newMessages,
      latestTimestamp: history.length > 0 ? history[history.length - 1].receivedAt : lastSeen
    });
  } catch (error) {
    console.error("Polling error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
