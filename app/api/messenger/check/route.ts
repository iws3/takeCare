import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "messages.json");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lastSeen = searchParams.get("lastSeen");

    if (!fs.existsSync(MESSAGES_FILE)) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const history = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    
    // Filter out old messages if lastSeen is provided
    let newMessages = history;
    if (lastSeen) {
      newMessages = history.filter((m: any) => new Date(m.receivedAt) > new Date(lastSeen));
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
